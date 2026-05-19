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

| # | id            | steps | What happens |
|---|---------------|-------|--------------|
| 1 | `title`       | 12    | Title → fade+center → Slack icon fades in → pacman eats dots → notification → eat → Slack window → bug report → composer+typing → delete → claude appears → pacman eats claude. One continuous scene. |
| 2 | `abstract`    | 1     | (legacy) frustration-as-signal hook. |
| 3 | `map`         | 1     | (legacy) lifecycle as a Pac-Man maze. |
| 4 | `slack`       | 1     | (legacy) full Slack UI. To be replaced. |
| 5 | `jira-list`   | 1     | (legacy) Jira backlog. To be replaced. |
| 6 | `jira-create` | 1     | (legacy) Jira create-issue form. To be replaced. |
| 7 | `claude`      | 1     | (legacy) Claude CLI. To be replaced. |
| 8 | `github`      | 1     | (legacy) GitHub PR. To be replaced. |
| 9 | `outro`       | 1     | (legacy) takeaway. |

Legacy scenes are kept in the array so Jan can revisit them when redesigning
their replacements.

---

## Scenes — detail

### 1. `title` — 12 steps

Opening card and the whole title → Slack flow → "ask Claude instead" beat,
merged into one scene so the pacman + dots persist as the same DOM elements
throughout (smooth animation across every beat).

- **Step 0** — Full title card.
  - Big yellow-and-white **BORING DRIVEN DEVELOPMENT** (top-left).
  - Tagline: "Let your laziness and frustration guide your creativity in AI workflows."
  - Pacman + 4 small pellets in the upper-right corner.
  - Footer: "Jan Marek" (left), Mews wordmark (right).
- **Step 1** — Title texts and Mews logo fade out. At the same time, pacman
  and the 4 pellets slide from the upper-right down to the centre of the stage,
  laying out into a horizontal trail. (No Slack icon yet.)
- **Step 2** — The Slack icon fades in on the right of the trail.
- **Step 3** — Pacman moves right along the trail, eating the dots in sequence.
- **Step 4** — A red notification badge ("1") pops onto the **top-right corner**
  of the Slack icon.
- **Step 5** — Pacman moves diagonally up-right to that corner and eats the
  notification.
- **Step 6** — Pacman exits right; the Slack icon shrinks; the schematic
  `#product-feedback` window scales in at the centre.
- **Step 7** — Petr's bug message slides into the window: _"hey, found a bug 🐛
  — the tax field disappears on second submit."_
- **Step 8** — Composer (text input + green send button) slides up from the
  bottom of the Slack window. A blinking cursor appears and a typewriter
  animation reveals the reply, character by character: _"please create a
  ticket in jira"_.
- **Step 9** — The typed message is deleted (typewriter reversed). The input
  goes back to empty. Narrative beat: never send it.
- **Step 10** — A Claude octopus icon scales in to the upper-right of the
  stage (outside the Slack window), with a soft orange glow and a "claude"
  label.
- **Step 11** — Pacman fades back in from offstage right and travels left
  to the Claude icon. As pacman arrives, Claude shrinks to nothing — eaten.

Each step is reversible with `←`. Continuous moves like the
pacman+dots travel are the recurring pattern for this presentation —
when adding scenes, prefer one merged scene with N step-keyed positions
over multiple scenes connected by hard cuts.

### 2. `abstract` — _(legacy, 1 step)_

The hook. Frustration as a creative signal. Kept from v1 for reuse.

### 3. `map` — _(legacy, 1 step)_

Full lifecycle as a Pac-Man maze with the apps drawn as ghosts. Kept from v1
for reuse.

### 4. `slack` — _(legacy, 1 step, to be replaced)_

Full Slack UI mock with a thread. To be reworked into a schematic version
matching the new title aesthetic.

### 5. `jira-list` · 6. `jira-create` · 7. `claude` · 8. `github` — _(legacy)_

Detailed app mocks from v1. Each will be replaced by a schematic counterpart
that follows the same transition flow Jan is building scene-by-scene.

### 9. `outro` — _(legacy, 1 step)_

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
