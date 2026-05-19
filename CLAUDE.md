# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Pac-Man-inspired HTML/CSS/JS presentation for a talk titled **Boring Driven Development** by Jan Marek (Mews). Pure static files — no build step, no dependencies, no package manager.

To run it: open `index.html` directly in a browser, or serve the directory with any static server (`python3 -m http.server`, `npx serve`, etc.).

## Navigation contract

The presentation MUST stay safe to drive forward live. Keep this in mind for every change:

- `→` / `↓` / `Space` / `PageDown` / right-half click → next scene
- `←` / `↑` / `PageUp` / left-half click → previous scene
- `Home` / `End` → first / last
- URL hash mirrors current scene id (e.g. `#claude`) for deep-linking
- Scene render is wrapped in try/catch — if a scene throws, a visible fallback is shown but navigation keeps working. Never bypass this safety net.

## Architecture

Three files do all the work:

- **`index.html`** — shell with a single `<div id="stage">` and a `<div id="hud">` counter. Don't add structural HTML here; build inside scenes.
- **`styles.css`** — design system + per-scene styles. The stage has fixed internal coordinates **1600 × 900**; JS applies a uniform `transform: scale(...)` on resize so it fits any viewport without breaking layout. Author scenes against the 1600×900 frame, not the viewport.
- **`script.js`** — scene registry + runtime. The entire presentation is the `scenes` array; everything else is plumbing.

### Adding / editing a scene

Scenes are objects in the `scenes` array in `script.js`:

```js
{
  id: "kebab-case-id",         // used for hash + slide counter
  notes: "one-liner",          // optional, runtime ignores it
  render: () => `<div class="scene">…</div>`,
}
```

Rules:
- The returned root must have `class="scene"` (it's positioned absolute, fills the stage).
- Use the shared helpers near the top of `script.js`: `pacman(dir, size)`, `ghost(color, label, size)`, `mazeSVG`, `claudeOctopus`. Don't reinvent them.
- App-window scenes (Slack/Jira/Claude/GitHub) follow this pattern:
  ```html
  <div class="app-window">
    <div class="app-titlebar">…</div>
    <div class="app-body …">…</div>
  </div>
  ```
- Whenever you add, remove, or rename a scene, update `presentation.md` to match. The two are intended to stay in sync — `presentation.md` is the human-readable spec, `script.js` is its implementation.

### Brand system

- **Colors** (CSS custom properties on `:root`): `--pink --orange --yellow --ecru --blue --mauve --offwhite --black`. Maze walls use `--wall` (pink). Dots use `--dot` (off-white). Always reference these variables, never hard-code hex.
- **Typography**: Söhne (loaded from `fonts/`) at weights 400 (Buch), 500 (Kräftig), 600 (Halbfett), 700 (Dreiviertelfett), 800 (Extrafett).
- **Logo**: `MEWS_WORDMARK_WHITE.png` — white wordmark on transparent background, use only on dark surfaces.

## Files

```
index.html          shell
styles.css          fonts, palette, scene styles
script.js           scenes[] + runtime
presentation.md     human-readable scene spec (keep in sync with scenes[])
fonts/              Söhne .otf files (5 weights)
MEWS_WORDMARK_WHITE.png
Screenshot ….png    reference: Mews brand palette
```

## Conventions that aren't obvious from the code

- **Stage is 1600×900, not responsive.** Don't introduce media queries for breakpoint-style layouts inside scenes. The whole stage is scaled uniformly by JS.
- **No frameworks.** Don't add React/Vue/build tooling. The "no build, just open in browser" property is a feature.
- **Interactive sub-steps inside a scene** are not yet implemented. If a scene needs multiple progression steps (e.g. type → submit → response), discuss the model with the user before adding — it changes the navigation contract.
- The parent `/Users/janmarek/projects/CLAUDE.md` applies to a multi-repo workspace and is not relevant inside this directory.
