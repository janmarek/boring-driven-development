// Boring Driven Development — framework.
// Reusable rendering helpers + scene navigation. The scene content lives
// in scenes.js (loaded first). Helpers (pacman, ghost, appWindow) are
// only called when a scene's render() runs, so the load order
// (scenes.js → runtime.js) is fine.
//
// Navigation:  ← / ↑ = back     → / ↓ / Space = forward

const STAGE_W = 1600;
const STAGE_H = 900;

// ---------------------- Reusable bits ----------------------

const pacman = (dir = "right", size = 80) => `
  <div class="pacman dir-${dir}" style="width:${size}px;height:${size}px">
    <div class="half top"></div>
    <div class="half bottom"></div>
    <div class="eye"></div>
  </div>
`;

const ghost = (color, label = "", size = 70) => `
  <div class="ghost" style="width:${size}px;height:${size * (80 / 70)}px">
    <svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="${color}" d="
        M5 35
        a30 30 0 0 1 60 0
        L65 72
        L57 80
        L50 72
        L42 80
        L35 72
        L28 80
        L20 72
        L13 80
        L5 72
        Z"/>
      <circle cx="22" cy="34" r="9" fill="#fff"/>
      <circle cx="48" cy="34" r="9" fill="#fff"/>
      <circle cx="24" cy="36" r="4" fill="#0a0a0a"/>
      <circle cx="50" cy="36" r="4" fill="#0a0a0a"/>
    </svg>
    ${label ? `<div class="ghost-label">${label}</div>` : ""}
  </div>
`;

// All icons live as standalone files under icons/.
// Scenes reference them with <img src="icons/foo.svg" ...>.
//   icons/slack-mark.svg     — official 2019 Slack mark (4 colors)
//   icons/jira-mark.svg      — Atlassian Jira chevrons
//   icons/claude-octopus.svg — legacy Claude CLI mascot (orange)
//   icons/claude-ai-icon.svg — Claude AI 4-petal burst
//   icons/pixel-octopus.svg  — Claude Code pixel mascot
//   icons/send-arrow.svg     — slack composer send button glyph
//   icons/search.svg         — jira toolbar search field icon
//
// Multi-color SVGs work directly via <img>; single-color SVGs have the
// fill baked in (since CSS can't reach into <img>-loaded SVGs). When a
// new icon needs runtime color, fall back to inlining the SVG markup
// directly in the render() call.

// ---------------------- appWindow() ----------------------
//
// Reusable shell for any "app window" in the deck. Returns the standard
// two-card HTML (header card + body card) styled by the .window classes
// in styles.css. See the "Reusable building blocks" section of
// CLAUDE.md for the full pattern, themes, and variant matrix.
//
// opts:
//   variant   "bold" (default) — large colored header (slack, jira)
//             "frame"           — mac titlebar with traffic lights (claude code, vscode)
//   theme     "violet"   slack purple
//             "jira"     atlassian blue
//             "terminal" claude code dark
//             "editor"   vscode dark
//             (omit for a plain shell — header colours come from your CSS)
//   title     string  — used as the centered title in the frame variant
//   header    HTML    — header content for the bold variant
//   body      HTML    — body content (always required)
//   modal     HTML    — optional content rendered after .window-body
//                       (positioned absolutely by your CSS — e.g. the
//                       jira create-issue modal overlay)
//   width     px (default 1100)
//   height    px (default 720)
//   className extra classes to put on the .window root (e.g. for an
//             entrance state like .my-scene-window or a utility class)
//
// Per-scene CSS drives the entrance/exit by targeting the .window
// element through the scene root, e.g.:
//   .my-scene .window               { transform: translate(60%, -50%); opacity: 0; }
//   .my-scene[data-step="0"] .window { transform: translate(-50%, -50%); opacity: 1; }
//   .my-scene[data-step="N"] .window { transform: translate(-180%, -50%); opacity: 0; }
const appWindow = (opts = {}) => {
  const variant = opts.variant || "bold";
  const theme = opts.theme ? ` window-theme--${opts.theme}` : "";
  const extra = opts.className ? ` ${opts.className}` : "";
  const w = opts.width || 1100;
  const h = opts.height || 720;
  const headerInner =
    variant === "frame"
      ? `<div class="window-traffic"><span></span><span></span><span></span></div>
         <div class="window-title">${opts.title || ""}</div>`
      : opts.header || "";
  return `
    <div class="window${theme}${extra}" style="width:${w}px;height:${h}px">
      <div class="window-header window-header--${variant}">${headerInner}</div>
      <div class="window-body">${opts.body || ""}</div>
      ${opts.modal || ""}
    </div>
  `;
};

// ---------------------- Runtime ----------------------
//
// Navigation model: (sceneIndex, stepIndex).
// → advances step within scene; at last step, jumps to next scene step 0.
// ← reverse.
//
// CSS hooks: the scene root carries `data-step="N"`. To let scenes animate
// from a clean "before" state into step 0 on first mount, data-step is set
// in the next animation frame after the HTML is inserted (so transitions
// have a starting style to interpolate from).

const stage = document.getElementById("stage");
const app = document.getElementById("app");
const xpBg = document.getElementById("xp-bg");
const xpLayerA = xpBg && xpBg.querySelector('[data-layer="a"]');
const xpLayerB = xpBg && xpBg.querySelector('[data-layer="b"]');
let xpFront = "a"; // which layer is currently on top (visible)
const counterEl = document.getElementById("counter");

// Crossfade the wallpaper. file === null fades both layers out (no
// wallpaper); otherwise writes the image onto the back layer, fades it
// in, fades the front out. The back becomes the new front. Calling
// repeatedly with the same file is harmless — both layers will end up
// showing the same image, but no visible flicker because the back
// layer fades in over 0.8s on top of an identical front.
function setWallpaper(file) {
  if (!xpLayerA || !xpLayerB) return;
  if (!file) {
    xpLayerA.classList.remove("is-visible");
    xpLayerB.classList.remove("is-visible");
    return;
  }
  const nextKey = xpFront === "a" ? "b" : "a";
  const nextEl = nextKey === "a" ? xpLayerA : xpLayerB;
  const prevEl = xpFront === "a" ? xpLayerA : xpLayerB;
  nextEl.style.backgroundImage = `url("${file}")`;
  nextEl.classList.add("is-visible");
  prevEl.classList.remove("is-visible");
  xpFront = nextKey;
}

// Exposed so a scene's onStep can crossfade wallpapers mid-scene (the
// merged claude-incident scene uses this to swap sunset → blue-hour at
// the editor→terminal beat without splitting into two scenes).
window.setWallpaper = setWallpaper;

let sceneIndex = 0;
let stepIndex = 0;
// True between "user pressed → past the last step" and the next scene
// being mounted. Used to play a scene's exit animation (declared via
// `exitDuration` on the scene + `.is-exiting` in CSS) before the DOM
// swap. Input is ignored during this window so a rapid-fire user can't
// double-mount.
let isAdvancing = false;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function stepsOf(scene) {
  return Math.max(1, scene.steps || 1);
}

function updateHud(scene) {
  const total = stepsOf(scene);
  const stepSuffix = total > 1 ? ` · step ${stepIndex + 1}/${total}` : "";
  counterEl.textContent = `${sceneIndex + 1} / ${scenes.length} · ${scene.id}${stepSuffix}`;
}

function mountScene(i, step = 0) {
  sceneIndex = clamp(i, 0, scenes.length - 1);
  const scene = scenes[sceneIndex];
  stepIndex = clamp(step, 0, stepsOf(scene) - 1);

  // Per-scene background tint on #app. Empty string clears the inline
  // value and reverts to the CSS default (--black). The transition lives
  // on #app in CSS, so swapping between scenes with different background
  // values fades smoothly.
  app.style.backgroundColor = scene.background || "";

  // Abstract XP-bliss-style wallpaper layer. The runtime keeps two
  // children of #xp-bg (.xp-layer[data-layer="a"|"b"]) and crossfades
  // between them whenever a scene supplies a new file. CSS owns the
  // 0.8s opacity transition; we just toggle which layer is visible
  // and write the new background-image onto the incoming layer.
  //   scene.xpBackground = true     → default icons/xp-bliss-bg.svg
  //   scene.xpBackground = "<path>" → that specific file (e.g. the
  //     vivid daytime / sunset / blue-hour variants used in the later
  //     XP-themed arc)
  setWallpaper(
    scene.xpBackground
      ? typeof scene.xpBackground === "string"
        ? scene.xpBackground
        : "icons/xp-bliss-bg.svg"
      : null
  );

  let html = "";
  try {
    html = scene.render();
  } catch (err) {
    console.error("Scene render failed:", scene && scene.id, err);
    html = `<div class="scene"><div class="scene-fallback">Scene "${scene && scene.id}" failed to render — press → to continue.</div></div>`;
  }
  stage.innerHTML = html;
  const root = stage.firstElementChild;

  // Apply data-step on next frame so transitions interpolate from the
  // pre-step default state into the step-0 state.
  requestAnimationFrame(() => {
    if (!root || !root.isConnected) return;
    root.dataset.step = String(stepIndex);
    if (typeof scene.onStep === "function") {
      try { scene.onStep(root, stepIndex, -1); } catch (e) { console.error(e); }
    }
  });

  updateHud(scene);
}

function applyStep(step) {
  const scene = scenes[sceneIndex];
  const prev = stepIndex;
  stepIndex = clamp(step, 0, stepsOf(scene) - 1);
  const root = stage.firstElementChild;
  if (root) root.dataset.step = String(stepIndex);
  if (typeof scene.onStep === "function") {
    try { scene.onStep(root, stepIndex, prev); } catch (e) { console.error(e); }
  }
  updateHud(scene);
}

function next() {
  if (isAdvancing) return;
  const scene = scenes[sceneIndex];
  if (stepIndex < stepsOf(scene) - 1) {
    applyStep(stepIndex + 1);
  } else if (sceneIndex < scenes.length - 1) {
    const exitMs = scene.exitDuration || 0;
    if (exitMs > 0) {
      // Run the scene's exit animation (CSS keyed off .is-exiting) and
      // delay the DOM swap until it finishes. This lets a scene have a
      // disappear animation without a dedicated "empty" exit step.
      const root = stage.firstElementChild;
      if (root) root.classList.add("is-exiting");
      isAdvancing = true;
      setTimeout(() => {
        isAdvancing = false;
        mountScene(sceneIndex + 1, 0);
      }, exitMs);
    } else {
      mountScene(sceneIndex + 1, 0);
    }
  }
}

function prev() {
  if (isAdvancing) return;
  if (stepIndex > 0) {
    applyStep(stepIndex - 1);
  } else if (sceneIndex > 0) {
    const target = scenes[sceneIndex - 1];
    mountScene(sceneIndex - 1, stepsOf(target) - 1);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
    case " ":
    case "PageDown":
      e.preventDefault();
      next();
      break;
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      e.preventDefault();
      prev();
      break;
    case "Home":
      e.preventDefault();
      isAdvancing = false;
      mountScene(0, 0);
      break;
    case "End":
      e.preventDefault();
      isAdvancing = false;
      mountScene(scenes.length - 1, stepsOf(scenes[scenes.length - 1]) - 1);
      break;
  }
});

function fit() {
  const pad = 40;
  const sw = (window.innerWidth - pad) / STAGE_W;
  const sh = (window.innerHeight - pad) / STAGE_H;
  const s = Math.min(sw, sh);
  stage.style.transform = `scale(${s})`;
}
window.addEventListener("resize", fit);
fit();

// Initial mount — always start at scene 0, step 0. No URL hash sync.
mountScene(0, 0);
