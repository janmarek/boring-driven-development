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
  scenes.map((s) => ({
    id: s.id,
    steps: Math.max(1, s.steps || 1),
    exitDuration: s.exitDuration || 0,
  }))
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
    if (s.id === "title" && step === 2) wait = 3000;          // dot-eat stagger (2.5s pacman + 0.2s anim end)
    else if (s.id === "title" && step === 3) wait = 2200;     // slack icon scale-in + 1s-delayed badge pop
    else if (s.id === "title" && step === 5) wait = 2200;     // window scale-in + 1s-delayed bug message slide
    else if (s.id === "title" && step === 6) wait = 2200;     // typewriter
    else if (s.id === "title" && step === 7) wait = 1100;     // reverse typewriter
    else if (s.id === "jira" && step === 2) wait = 1800;      // summary typewriter
    else if (s.id === "jira" && step === 3) wait = 4400;      // staggered field fills (last delay 3.80s + 0.3s anim)
    else if (s.id === "claude-arrival" && step === 0) wait = 2200;  // auto-rotate (1.0s) + dot cascade (1.1s delay) + icon (1.4s delay)
    else if (s.id === "claude-arrival" && step === 1) wait = 2000;  // 1.4s descent + icon shrink
    else if (s.id === "claude-work" && step === 2) wait = 2300;  // prompt 1 typewriter
    else if (s.id === "claude-work" && step === 3) wait = 2000;  // tool calls + error stagger
    else if (s.id === "claude-work" && step === 4) wait = 2000;  // prompt 2 typewriter
    else if (s.id === "ghost-rules" && step === 1) wait = 1100;  // ghost glides in
    else if (s.id === "ghost-rules" && step === 4) wait = 1300;  // pacman rotate + descend + coffee shrink
    else if (s.id === "claude-pr-flow" && step === 1) wait = 1800;  // tw-1 (1.4s)
    else if (s.id === "claude-pr-flow" && step === 2) wait = 1700;  // 4 tasks stagger (last delay 1.05s + 0.3s)
    else if (s.id === "claude-pr-flow" && step === 3) wait = 2700;  // tasks check-off stagger (last delay 2.05s + 0.3s)
    else if (s.id === "claude-pr-flow" && step === 4) wait = 2400;  // 4 notifs stagger (last delay 1.55s + 0.45s)
    else if (s.id === "claude-pr-flow" && step === 5) wait = 2200;  // tw-2 (1.8s)
    else if (s.id === "claude-pr-flow" && step === 7) wait = 1600;  // tw-3 (1.2s)
    else if (s.id === "claude-pr-flow" && step === 9) wait = 2400;  // tw-4 (2.0s)
    else if (s.id === "boring-grid" && step === 1) wait = 1300;  // top-row ghost stagger (last delay 0.65 + 0.5)
    else if (s.id === "boring-grid" && step === 2) wait = 1300;  // bottom-row ghost stagger
    // Merged claude-incident — editor + alerts beats, then terminal:
    else if (s.id === "claude-incident" && step === 1) wait = 2200;  // 4 alerts stagger (last delay 1.40 + 0.45s)
    else if (s.id === "claude-incident" && step === 2) wait = 1600;  // editor exit + terminal enter + wallpaper crossfade
    else if (s.id === "claude-incident" && step === 3) wait = 2300;  // tw-1 (1.6s) + alerts fade
    else if (s.id === "claude-incident" && step === 4) wait = 2800;  // logs/trace/diff stagger (last delay 2.20s + 0.3s)
    else if (s.id === "claude-incident" && step === 6) wait = 2300;  // tw-2 (1.7s)
    else if (s.id === "claude-incident" && step === 9) wait = 2200;  // 4 thanks stagger
    // On the first step of any scene whose predecessor has an
    // exitDuration, add that exit time + entrance buffer to the wait so
    // we don't screenshot mid-transition between scenes.
    if (step === 0 && i > 0) {
      const prevExitMs = scenes[i - 1].exitDuration || 0;
      if (prevExitMs > 0) wait = Math.max(wait, prevExitMs + 900);
    }
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
