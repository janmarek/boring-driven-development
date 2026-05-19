// Screenshot verification: walk the presentation, capture each scene + step.
// Run: node verify.mjs
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/") urlPath = "/index.html";
    const filePath = join(__dirname, urlPath);
    const buf = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mime[extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    res.end(buf);
  } catch (err) {
    res.writeHead(404);
    res.end("not found: " + req.url);
  }
});

await new Promise((r) => server.listen(PORT, r));
console.log(`server up at http://localhost:${PORT}`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await ctx.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("[browser-error]", msg.text());
});
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto(`http://localhost:${PORT}/`);
await page.waitForFunction(() => document.querySelector(".scene") !== null);

const scenes = await page.evaluate(() =>
  // Pull the scenes manifest from the page
  // eslint-disable-next-line no-undef
  scenes.map((s) => ({ id: s.id, steps: Math.max(1, s.steps || 1) }))
);
console.log(`found ${scenes.length} scenes`);

const shotDir = join(__dirname, "verify-shots");
await import("fs").then(({ mkdirSync }) => mkdirSync(shotDir, { recursive: true }));

// Walk through scenes by pressing ArrowRight — this matches the real flow
// (sub-step animations run because we navigate step-by-step rather than jumping).
let total = 0;
// Start at scene 0 step 0
await page.evaluate(() => mountScene(0, 0));
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  for (let step = 0; step < s.steps; step++) {
    // Wait for any in-flight transitions / animations to play out.
    // Some steps have long transitions that must finish before the screenshot:
    //  - slack-arrival step 0: legacy long pacman traverse (2.8s)
    //  - title step 3: pacman traverses centre + dots staggered eat (~1.5s)
    //  - title step 8: typewriter animation reveals message (~1.8s)
    //  - title step 11: pacman returns from offstage and eats claude (~1.6s)
    let wait = 900;
    if (s.id === "slack-arrival" && step === 0) wait = 2800;
    else if (s.id === "title" && (step === 3 || step === 8 || step === 11)) wait = 2200;
    else if (s.id === "title" && step === 9) wait = 1100;     // reverse typewriter
    else if (s.id === "title" && step === 12) wait = 1100;    // slack flies left
    else if (s.id === "jira" && step === 2) wait = 1800;      // summary typewriter
    else if (s.id === "jira" && step === 3) wait = 2400;      // 6 staggered field fills (last delay 1.6s + 0.3s anim)
    else if (s.id === "jira" && step === 4) wait = 1100;      // jira flies left
    await page.waitForTimeout(wait);
    const filename = `${String(i + 1).padStart(2, "0")}-${s.id}-step${step}.png`;
    await page.locator("#stage").screenshot({ path: join(shotDir, filename) });
    total++;
    process.stdout.write(`  ${filename}\n`);
    // Advance to next step (or next scene's step 0)
    const isLast = i === scenes.length - 1 && step === s.steps - 1;
    if (!isLast) await page.keyboard.press("ArrowRight");
  }
}

await browser.close();
server.close();
console.log(`done, ${total} screenshots in ${shotDir}`);
