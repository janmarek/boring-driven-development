# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Pac-Man-inspired HTML/CSS/JS presentation for a talk titled **Boring Driven Development** by Jan Marek (Mews). Pure static files — no build step, no dependencies, no framework.

Run it: open `index.html` directly in a browser, or serve the directory (`python3 -m http.server`, `npx serve`, etc.). Local fonts and the wordmark PNG load fine over `file://`.

## Navigation contract

The presentation MUST stay safe to drive forward live. Keep this in mind for every change:

- `→` / `↓` / `Space` / `PageDown` → next step (or next scene if at last step)
- `←` / `↑` / `PageUp` → previous step (or previous scene)
- `Home` / `End` → first / last
- **Keyboard only.** Click-to-advance was removed in iter 11 — Jan doesn't want stray clicks during the talk to skip a beat. Don't add a click handler back.
- **No URL hash sync** (also removed in iter 11). The deck always starts at scene 0, step 0 on refresh. Don't add hash deep-linking back unless explicitly asked.
- Scene render is wrapped in try/catch — if a scene throws, a visible fallback is shown but navigation keeps working. Never bypass this safety net.

## Architecture

Four files do all the work:

- **`index.html`** — shell with `<div id="stage">` + `<div id="hud">`. Don't add structural HTML here; build inside scenes. Loads `scenes.js` then `runtime.js` (in that order).
- **`styles.css`** — design system + per-scene styles. Stage is **1600 × 900 internal coordinates**; JS applies a uniform `transform: scale(...)` on resize. Author against 1600×900, not the viewport.
- **`scenes.js`** — the `scenes` array. This is the content you edit when iterating on a beat. References helpers (`pacman`, `ghost`, `appWindow`) defined in runtime.js, but those are only called when `render()` runs, so the load order is fine even though the helpers don't exist when scenes.js evaluates.
- **`runtime.js`** — the framework: stage constants, the helper templates, and the scene mount/navigation logic. Stable; rarely needs to change. Calls `mountScene(0, 0)` at the bottom to start the deck.

**Heuristic when iterating**: read `scenes.js` to change a scene; only open `runtime.js` if you need to check a helper signature or change navigation behaviour.

### Scene shape

```js
{
  id: "kebab-case-id",         // used for URL hash + slide counter
  notes: "one-liner",          // optional, runtime ignores
  steps: 8,                    // optional, defaults to 1
  exitDuration: 500,           // optional ms — see "Exit animations" below
  render: () => `<div class="scene my-scene">…</div>`,
  onStep: (root, step, prev) => {…} // optional, called on each step change
}
```

The returned root must have `class="scene"`. The runtime writes `data-step="N"` on it. Drive in-scene animation with CSS keyed off `data-step`.

### Exit animations

When a scene needs a visible disappear before the next scene mounts (e.g. the jira window scaling down on the press that advances to claude-arrival), declare `exitDuration` in ms. On `next()` past the last step, the runtime adds `.is-exiting` to the scene root, waits `exitDuration`, then swaps the DOM. Input is ignored during the wait so a rapid-fire press can't double-mount.

Author the exit purely in CSS, scoped to `.is-exiting`:

```css
.jira.is-exiting .jira-window {
  transform: translate(-50%, -50%) scale(0.82);
  opacity: 0;
  transition: transform 0.5s, opacity 0.45s;
}
```

This avoids the "post-flight, nothing visible" problem you get from putting the exit in its own step — the HUD never shows an empty extra step, and the audience still sees the disappear.

### Mount + step lifecycle (important)

`mountScene()` (defined in runtime.js) does this:

1. `stage.innerHTML = scene.render()`.
2. **On the next animation frame**, sets `root.dataset.step = stepIndex`.

The rAF deferral is load-bearing: it gives the browser one frame to compute the **bare** element rules (no `[data-step]` matching), then applies the step state. CSS `transition`s therefore interpolate from the bare state into the step-0 state on initial mount. If you set `data-step` synchronously after `innerHTML`, the browser folds both into one layout and you get no entrance transition.

The bare element rules (no `[data-step]` selector) are effectively your **"before scene begins" state**. Step 0 is the **"scene begins" state**. The difference between them is what animates on initial mount.

In-scene step changes (e.g. step 2 → step 3) just toggle `data-step`. CSS transitions between adjacent step rules animate the diff.

## Reusable building blocks

Use these instead of writing from scratch each scene. Iteration is much
faster when you compose the same primitives every time and only write
the scene-specific bits.

### `appWindow()` — the standard two-card "app window"

Every "app window" in the deck (slack, jira, claude code, vscode, …)
follows the same recipe: two flush stacked elements (header plate +
body plate) with one drop-shadow on the wrapper. Visually one rounded
window; technically two elements (so the WebKit antialiasing fringe at
the header/body joint can't appear — see Common pitfalls).

JS helper in `runtime.js`:

```js
appWindow({
  variant: "bold",       // "bold" (large colored header) or "frame" (mac titlebar)
  theme:   "violet",     // "violet" | "jira" | "terminal" | "editor"
  title:   "claude code",// frame variant — centered title between traffic lights
  header:  `<span># product-feedback</span>`,  // bold variant — header content
  body:    `<div class="...">…</div>`,         // always required
  modal:   `<div class="...modal...">…</div>`, // optional overlay after .window-body
  width:   1100,         // px — default 1100
  height:  720,          // px — default 720
  className: "my-scene-window", // extra classes on .window root
})
```

CSS lives at the top of `styles.css`: `.window`, `.window-header`,
`.window-body`, header variants `.window-header--bold` / `--frame`,
and color themes `.window-theme--violet|jira|terminal|editor`.

Variant matrix:

| theme       | header background | body background | typical use      |
|-------------|-------------------|-----------------|------------------|
| `violet`    | `#3f0e40` (slack) | offwhite        | slack channels   |
| `jira`      | `#0747a6`         | offwhite        | jira             |
| `terminal`  | (default `#2a2a2e` from frame) | `#0a0a0a` | claude code |
| `editor`    | (default from frame)           | `#1e1e1e` | vscode      |

Per-scene CSS still owns the entrance/exit by targeting the `.window`
through the scene root and the `[data-step]` selector. The canonical
pattern:

```css
.my-scene .window {              /* "before scene" — off-stage right */
  transform: translate(60%, -50%) scale(1);
  opacity: 0;
}
.my-scene[data-step="0"] .window,
.my-scene[data-step="1"] .window { /* "centered" */
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
.my-scene[data-step="N"] .window { /* "exit left" */
  transform: translate(-180%, -50%) scale(1);
  opacity: 0;
  transition: transform 0.75s cubic-bezier(.7, 0, .84, 0.2),
              opacity 0.55s ease-in 0.2s;
}
```

### `.typewriter` + `.cursor` — animated text reveal

Wrap text in `.typewriter` and pair with a `.cursor` sibling. The
parent reveals the text one char at a time when its `max-width`
animates via `steps()`. The cursor is inline-block so it naturally
follows the right edge.

```html
<div class="sw-input">
  <span class="typewriter"><span>please create a ticket in jira</span></span><span class="cursor is-on"></span>
</div>
```

Drive it per step:

```css
.my-scene[data-step="2"] .typewriter {
  max-width: 32ch;
  transition: max-width 1.8s steps(31, end);
}
.my-scene[data-step="3"] .typewriter { max-width: 0; }   /* delete = reverse-type */
```

Reverse-nav is clean: pressing `←` un-types the message. Per-scene
font-size determines `ch` width so pick `max-width` in `ch` slightly
larger than the actual char count (e.g. 32ch for 30 chars).

### `.stagger-fill` + `.stagger-item` — "look at all this" reveal

Children of a `.stagger-fill` parent fade in with per-`:nth-child`
delays. The "look at all the fields you have to fill" beat from the
jira create modal. Defaults handle up to 8 items; override via
inline `transition-delay` if you need more.

```html
<div class="stagger-fill">
  <div class="stagger-item">…</div>
  <div class="stagger-item">…</div>
</div>
```

The scene's per-step CSS activates the reveal at the active step:

```css
.my-scene[data-step="3"] .stagger-fill > .stagger-item {
  opacity: 1;
  transform: translateY(0);
}
```

### Window fly-in / fly-out transitions

The window CSS already has a generous default `transition` list
(`transform`, `opacity`, `filter`). For specific tuning, override on
the active-step selector — see the canonical patterns in the title
scene (slack fly-left at step 12) and the jira scene (jira fly-in from
the right at step 0, fly-left at step 4).

Typical values:
- Fly-in:  `transform 0.65s cubic-bezier(.34, 1.2, .64, 1)` from
  `translate(60%, -50%)` to `translate(-50%, -50%)`.
- Fly-out: `transform 0.75s cubic-bezier(.7, 0, .84, 0.2)` to
  `translate(-180%, -50%)`, plus `opacity 0.55s ease-in 0.2s`.

### When to extract vs hard-code

If a pattern is used in 2+ scenes, extract it. The window class,
typewriter, and stagger-fill are reused; they live in the
"Reusable building blocks" CSS block at the top of `styles.css`.
Scene-specific styling (the exact ticket-row layout for the jira list,
the chomp animation on pacman) is fine to keep co-located with the
scene.

## The merged-scene pattern (dominant for this deck)

The single most important architectural choice: **a continuous visual sequence is ONE scene with N steps, not N scenes**.

Why: mounting a new scene swaps the DOM. Pacman at the end of scene A and pacman at the start of scene B are different DOM elements, so transitions can't span them — you get a hard cut. With one scene, the same `.intro-pacman` DOM element animates via CSS transitions across all steps. The visual continuity is the whole point.

The `title` scene is the canonical example: 8 steps, single DOM tree containing pacman, dots, slack icon, notification, schematic window. Each element has CSS rules per `[data-step="N"]` that change its position / opacity / scale. Transitions interpolate the changes when the user navigates.

When the user describes a flow that includes multiple "beats" (pacman moves, icon appears, badge pops, message arrives, etc.), default to extending an existing scene's `steps` count rather than creating a new scene.

## Authoring step-driven animation

For each element you want to animate across steps:

1. Define **default** properties (the "before scene begins" or step-0 state).
2. Add a `transition` rule for the properties you'll vary.
3. Write `[data-step="N"]` selectors for every step where the property differs from the previous step.

Example for an element that moves between three positions:

```css
.intro .intro-pacman {
  position: absolute;
  width: 84px;
  height: 84px;
  transform: translate(-50%, -50%);
  left: 1320px;   /* step 0 default: upper right */
  top: 180px;
  transition-property: left, top, opacity;
  transition-duration: 0.85s, 0.85s, 0.4s;  /* one value per property */
  transition-timing-function: ease-in-out;
}
.intro[data-step="1"] .intro-pacman { left: 350px; top: 450px; }
.intro[data-step="3"] .intro-pacman {
  left: 780px; top: 450px;
  transition-duration: 1.5s, 1.5s, 0.4s;     /* longer travel = longer duration */
}
.intro[data-step="5"] .intro-pacman {
  left: 1000px; top: 380px;
  transition-duration: 0.6s, 0.6s, 0.4s;
}
```

### Per-step duration overrides

A single element often needs different transition durations for different step transitions — pacman crossing the whole screen (1.5s) vs. nudging up to a corner (0.6s). Override `transition-duration` per step. The comma-separated values must match the order of `transition-property`.

### `transition` vs `@keyframes`

Use **`transition`** for anything that should reverse cleanly when the user navigates backward. CSS transitions interpolate both directions automatically.

Use **`@keyframes`** only for one-shot effects that don't need to rewind (a pellet being eaten, a screen shake). `animation-fill-mode: forwards` plus `animation-delay` is the right tool for staggered "eaten in sequence" effects, but the reverse-nav doesn't restore them — that's a known trade-off.

The staggered dot-eating uses `transition` with per-`:nth-child` `transition-delay`, not `@keyframes`. That way pressing ← un-eats the dots cleanly.

### Holding a state across steps

If an element should stay in the same position for several adjacent steps, **list all those steps in the selector**:

```css
.intro[data-step="3"] .intro-pacman,
.intro[data-step="4"] .intro-pacman {
  left: 780px; top: 450px;
}
```

It's verbose, but explicit. When you insert a new step in the middle of a flow, you have to shift all subsequent step numbers — accept the find-and-replace.

## Coordinate authoring

The stage is 1600 × 900. Author with absolute pixel coordinates. Pacman is 84px; the slack icon is 160px; the notification badge is 56px. When placing two elements next to each other, do edge-to-edge math:

```
gap = (right_center - right_half) - (left_center + left_half)
```

If `gap` is ≤ 0, the elements overlap visually. A 30–80px gap usually reads as "next to" without touching. The first take of the slack-arrival scene had pacman ending at 830 and the slack icon at 950 — edge gap of −2px, hence the touching/overlap that the user flagged.

Slack icon top-right corner = `(icon_center_x + 80, icon_center_y - 80)`. The notification badge centers on that point. When you move the slack icon, update the notification position too.

## Common pitfalls I've hit

- **`.scene` is `position: absolute; inset: 0`.** Don't override with `position: relative` in your scene's class — that drops `inset` (which only applies to absolutely-positioned elements), the scene collapses to height 0 (no in-flow content, since children are absolute), and `overflow: hidden` on the parent clips everything. Result: black screen. If you need a different stacking context inside the scene, do it on a child, not the root.

- **`:nth-child(N)` matches position among ALL siblings, not among elements-of-this-class.** If your `.trail-dot:nth-child(1)` shares a parent with non-trail-dot siblings, the first dot is `:nth-child(2)`, etc. Either wrap the targets in a dedicated parent so the indices align, or use `:nth-of-type` (works only if elements share an HTML tag and that tag isn't used by anything else under the parent).

- **Transitions don't trigger when the element's computed value doesn't change.** If you write `.intro[data-step="0"] .x { left: 100px }` and the element's default (no selector) is also `left: 100px`, the rAF data-step assignment won't fire a transition. Define the bare element rules to be different from step-0 if you want an entrance animation; if you don't, leave them identical and accept the instant-snap.

- **rAF defer is required for the entrance transition.** Setting `data-step` synchronously after `innerHTML` collapses to a single layout pass; the browser sees no change. The runtime already handles this; don't bypass it.

- **Forward and backward navigation aren't perfectly symmetric.** Anything done with `@keyframes ... forwards` (one-shot animation) sticks at the end state and won't rewind on ←. That's acceptable for "eaten" effects but not for state you want to scrub. Use `transition` for scrubbable state.

- **Multiple elements at the same logical position need separate CSS rules.** Pacman, the slack icon, and the notification all sit at roughly (950, 450) during step 4, but each has its own CSS rule and its own transition. Don't try to use a wrapper to position them as a group — they animate independently.

## Verification with Playwright

`verify.mjs` boots a local HTTP server, drives the deck via real keyboard arrow presses, and dumps a PNG of `#stage` per scene/step into `verify-shots/` (gitignored).

```sh
node verify.mjs        # ~15s end-to-end
```

**Don't run this by default.** Jan checks the deck manually after every iteration in the browser, so screenshot runs on routine edits are redundant. Use it only when:

- The change involves a risky UI manipulation (new merged scene, big CSS rewrite, anything that could black-screen the deck or break the mount lifecycle) and you genuinely can't reason about the outcome from code alone.
- Jan explicitly asks you to verify or run the walker.

What it catches when you do run it: positioning, selector mismatches, black-screen regressions, step-by-step state correctness. Read the PNGs back with the `Read` tool — Claude Code renders them inline. The walker waits 2.8s on `title-step0` (long travel transition) and 900ms on every other step; bump the wait in `verify.mjs` if you add a transition longer than 900ms.

## The iteration loop with Jan

Jan drives the deck scene-by-scene, giving directional feedback ("move this left", "fade this in as its own step", "the slack window looks good"). The workflow is:

1. **Read the feedback as a concrete brief.** Jan tends to bundle multiple small asks in one message. Pick them apart and treat each as a tracked task.
2. **Make the change.** Prefer editing existing CSS rules / scene step counts over adding new scenes. Continuous-flow changes mean shifting step numbers in CSS — accept the find-and-replace.
3. **Don't auto-verify.** Jan checks the deck in the browser himself. Skip `node verify.mjs` unless the change is risky (see the Verification section) or Jan asks.
4. **Update `presentation.md`** to match the new scene/step layout. Step numbers in the doc must match `data-step` values used in CSS. The doc is the spec; mismatched docs are bugs.
5. **Commit.** One commit per iteration ("iter N: <one-line summary>"). Include both the user-visible change and the why in the message body. Co-author trailer goes on every commit (`Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`).
6. **Tell Jan what changed** in a short message with the new step list and what to look at. Leave a question or two open so the next direction can be quick.

Commit cadence is **per iteration**, not per individual file edit. One direction from Jan → one commit (even if it touches CSS, JS, and the doc together). The history reads as a series of "iter N: …" steps tracking the design conversation.

### When to update CLAUDE.md

Whenever I hit a bug whose root cause wasn't obvious from the code (the `position: relative` collapse, the `:nth-child` mismatch, the rAF requirement for entrance transitions), add it to **Common pitfalls** so it doesn't bite the next time.

Whenever Jan establishes a new pattern ("continuous moves are the common theme", "merge into one scene with steps rather than split"), document it so future scenes follow the same approach instead of reinventing.

Don't document things already obvious from a quick read of the code (file structure, what `pacman()` returns, etc.).

## Brand system

- **Colors** (CSS custom properties on `:root`): `--pink --orange --yellow --ecru --blue --mauve --offwhite --black`. Always use the variables, never hard-coded hex.
- **Typography**: Söhne (loaded from `fonts/`) at weights 400 / 500 / 600 / 700 / 800.
- **Logo**: `MEWS_WORDMARK_WHITE.png` — white wordmark on transparent background, use only on dark surfaces. The PNG has wide transparent padding around the wordmark, so a 72px-tall `<img>` only shows ~25px of actual mark.

## Files

```
index.html              shell (loads scenes.js then runtime.js)
styles.css              fonts, palette, scene styles
scenes.js               the scenes[] array — what you edit per iteration
runtime.js              helpers (pacman, ghost, appWindow) + mount/navigation
presentation.md         human-readable scene spec (keep in sync with scenes[])
verify.mjs              Playwright walker (boots local server, screenshots each step)
package.json            dev deps (Playwright)
fonts/                  Söhne .otf files (5 weights)
icons/                  all reusable icons as standalone .svg files
                        (referenced via <img src="icons/foo.svg">)
MEWS_WORDMARK_WHITE.png
Screenshot ….png        reference: Mews brand palette
```

### `icons/` convention

Icons live as standalone files under `icons/` rather than inlined in
`scenes.js`, to keep the JS readable. Scenes reference them via
`<img src="icons/foo.svg" alt="">`. Because `<img>`-loaded SVGs are
opaque to CSS (can't reach `currentColor`), the file should bake the
final fill colors in. When an icon needs runtime-varied color, fall
back to inlining the SVG markup directly in the render() call.

Current set:

| File                     | Used by                                  |
|--------------------------|------------------------------------------|
| `slack-mark.svg`         | title scene — slack icon                 |
| `claude-octopus.svg`     | title scene + legacy claude              |
| `claude-ai-icon.svg`     | claude-arrival — Anthropic burst         |
| `pixel-octopus.svg`      | claude-arrival — Claude Code mascot      |
| `send-arrow.svg`         | title scene — slack composer send button |
| `search.svg`             | jira scene — toolbar search field        |

## Conventions that aren't obvious from the code

- **Stage is 1600×900, not responsive.** Don't add media queries inside scenes. The whole stage is scaled uniformly by JS.
- **No frameworks. No build step.** Don't add React/Vue/etc. "Just open `index.html`" is a feature.
- **Each beat the user controls is a step.** Don't auto-chain beats — the talk's whole feel depends on the speaker pressing → when they're ready.
- **Update `presentation.md` whenever scenes/steps change.** It's the human-readable spec; `scenes.js` is the implementation. They must stay in sync.
- **Legacy scenes were pruned in iter 11.** The flow-recreation legacies (map, slack, jira-list, jira-create, claude CLI) and the now-unused `.slack-arrival` CSS were removed once the new scenes (jira, claude-arrival, claude-work, skill) covered the same ground. Only `abstract`, `github`, and `outro` are kept as legacy slides for reuse. **Don't delete those** without an explicit ask, and don't re-introduce the removed ones without a reason — the new scenes are the canonical version of each beat.
- The parent `/Users/janmarek/projects/CLAUDE.md` applies to a multi-repo workspace and is not relevant inside this directory.
