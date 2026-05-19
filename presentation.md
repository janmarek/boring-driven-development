# Boring Driven Development

**Speaker:** Jan Marek · Mews
**Format:** HTML/CSS/JS presentation, Pac-Man-inspired
**Run:** open `index.html` in a browser
**Navigate:** `→` / `↓` / `Space` = forward · `←` / `↑` = back · `Home` / `End` = first / last
**Click:** right half of screen = next, left half = previous

Each scene may have multiple internal **steps**. Forward arrow walks through
the steps inside a scene; once at the last step it jumps to the next scene.

---

## Talk abstract

Boring Driven Development — let your laziness and frustration guide your creativity
in your AI workflows.

Creativity in engineering doesn't always start with inspiration, sometimes it starts
with frustration. What you don't feel like doing is your best signal for where to
improve.

We'll walk through the full lifecycle of a software feature — from a Slack thread,
through a Jira ticket, code, a pull request, and all the way to announcing it to
the world — and at each step, examine how "I really don't want to do this manually"
became the motivation to automate.

You don't need to be a naturally creative person. You just need to pay attention to
what bores you.

---

## Scene list

| # | id              | steps | What happens |
|---|-----------------|-------|--------------|
| 1 | `title`         | 1     | Title card. |
| 2 | `slack-arrival` | 5     | Pacman travels the map and lands on Slack → bug report appears. |
| 3 | `abstract`      | 1     | (legacy) frustration-as-signal hook. |
| 4 | `map`           | 1     | (legacy) lifecycle as a Pac-Man maze. |
| 5 | `slack`         | 1     | (legacy) full Slack UI. To be replaced. |
| 6 | `jira-list`     | 1     | (legacy) Jira backlog. To be replaced. |
| 7 | `jira-create`   | 1     | (legacy) Jira create-issue form. To be replaced. |
| 8 | `claude`        | 1     | (legacy) Claude CLI. To be replaced. |
| 9 | `github`        | 1     | (legacy) GitHub PR. To be replaced. |
| 10 | `outro`        | 1     | (legacy) takeaway. |

Legacy scenes are kept in the array so Jan can revisit them when redesigning
their replacements.

---

## Scenes — detail

### 1. `title` — 1 step

Opening card.

- Big yellow-and-white title: **BORING DRIVEN DEVELOPMENT** (top-left, very large).
- Tagline below: "Let your laziness and frustration guide your creativity in AI workflows."
- Pacman + 4 pellets in the upper-right corner.
- Footer: "Jan Marek" (left), Mews wordmark (right, large).

### 2. `slack-arrival` — 5 steps

Map-traversal transition from title into the start of the lifecycle.
Every beat is advanced by `→`.

- **Step 0** — Pacman starts at the left, travels right along a row of pellets,
  eating them in sequence. The Slack icon scales in at the center as Pacman
  arrives next to it.
- **Step 1** — A red notification badge ("1") pops onto the Slack icon.
- **Step 2** — Pacman moves the last short distance into the icon and "eats"
  the badge — the badge disappears just as Pacman arrives.
- **Step 3** — Slack icon expands into a schematic Slack window
  (`#product-feedback` header, simplified message placeholders).
- **Step 4** — A new message appears in the window: **Petr · PM** — _"hey,
  found a bug 🐛 — the tax field disappears on second submit."_

Each step is reversible with `←`.

### 3. `abstract` — _(legacy, 1 step)_

The hook. Frustration as a creative signal. Kept from v1 for reuse.

### 4. `map` — _(legacy, 1 step)_

Full lifecycle as a Pac-Man maze with the apps drawn as ghosts. Kept from v1
for reuse.

### 5. `slack` — _(legacy, 1 step, to be replaced)_

Full Slack UI mock with a thread. To be reworked into a schematic version
in step with the new `slack-arrival` aesthetic.

### 6. `jira-list` · 7. `jira-create` · 8. `claude` · 9. `github` — _(legacy)_

Detailed app mocks from v1. Each will be replaced by a schematic counterpart
that follows the same transition flow Jan is building scene-by-scene.

### 10. `outro` — _(legacy, 1 step)_

Takeaway slide. Will be revisited at the end.

---

## How a scene is defined

Each scene is an object in the `scenes` array inside `script.js`:

```js
{
  id: "kebab-case-id",         // appears in URL hash + slide counter
  notes: "one-liner for me",   // optional, ignored at runtime
  steps: 5,                    // optional, defaults to 1
  render: () => `<div class="scene …">…</div>`,
  // optional: onStep(rootEl, stepIndex, prevStepIndex) → run JS per beat
}
```

- The root element must have `class="scene"`. Anything else is up to the scene.
- The runtime writes `data-step="N"` on the root. CSS keys off that:
  ```css
  .my-scene[data-step="2"] .thing { transform: …; }
  ```
- On initial mount of a scene, `data-step` is applied on the next animation
  frame so CSS transitions interpolate from a clean "before" state into
  step 0. Define the "before" state as the bare element rules and the
  "step 0" state in the `[data-step="0"]` selector.
- Use `transition` (not `animation`) on properties that should move forward
  AND back as the user navigates with arrow keys. Reserve `@keyframes` for
  one-shot effects (like a pellet being eaten) that don't need to rewind.
- Shared helpers in `script.js`: `pacman(dir, size)`, `ghost(color, label, size)`,
  `mazeSVG`, `claudeOctopus`, `slackMarkSVG`.

---

## Assets

- `MEWS_WORDMARK_WHITE.png` — Mews logo, used in the title slide footer.
- `fonts/Söhne-*.otf` — primary typeface, mapped to weights 400–800 in `styles.css`.
- `Screenshot 2026-05-19 at 21.18.13.png` — Mews brand palette reference.

## Things we might want later

- Real screenshots of Jira / GitHub if pixel-accurate frames are needed
  instead of schematic versions.
- A proper Slack-style emoji/reaction set.
- A Claude CLI splash captured from the real terminal.
