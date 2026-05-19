# Boring Driven Development

**Speaker:** Jan Marek · Mews
**Format:** HTML/CSS/JS presentation, Pac-Man-inspired
**Run:** open `index.html` in a browser
**Navigate:** `→` / `↓` / `Space` = forward · `←` / `↑` = back · `Home` / `End` = first / last
**Keyboard only** — clicks don't advance, so stray taps during the talk
won't skip a beat.

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
| 1 | `title`         | 10    | Title → fade+center → pacman eats dot trail → Slack icon appears → notification → eat → Slack window (two-card schematic) → bug report → composer+typing "please create a ticket in jira" → delete. Advance from the last step cuts straight to the jira scene flying in. |
| 2 | `jira`          | 5     | Schematic Mews Jira: detailed backlog flies in (Mews toolbar + table) → "+ Create" modal scales in → summary typewriter → required fields fill in stagger (type, team, story points, label chips one-by-one, structured description) → window scales down + fades out. |
| 3 | `claude-arrival`| 4     | Pacman center-top, rotates to face down, descends along a 3-dot trail, eats Claude AI icon → Claude code window scales in (mac frame + terminal theme) with the pixel-octopus mascot and "claude" branding. |
| 4 | `claude-work`   | 6     | Terminal flow: MCP connect (slack + atlassian) → user prompt "create a jira ticket…" → tool calls (Read slack thread, Call createJiraIssue) → error about required fields → user prompt "create a skill from how you learned creating jiras" → ✓ saved. |
| 5 | `skill`         | 1     | VS Code-ish editor showing `.claude/skills/jira-grw.md` — frontmatter (name / description / allowed-tools / references with saved ids) and body (When to use / Required fields / Description template). |
| 6 | `github`        | 1     | (legacy) GitHub PR mock. Will be redone as a schematic scene later. |
| 7 | `abstract`      | 1     | (legacy slide) frustration-as-signal closing — pink ghost above the heading, "inspiration." in pink, "frustration." in yellow. |

Legacy scenes removed in iter 11 (map, slack, jira-list, jira-create, claude
CLI) — the new scenes 2–5 cover the same ground.

---

## Scenes — detail

### 1. `title` — 10 steps

Opening card and the whole title → Slack flow, merged into one scene so the
pacman + dots persist as the same DOM elements throughout (smooth animation
across every beat). The "ask Claude instead" beat now lives in `claude-arrival`.

- **Step 0** — Full title card.
  - Big yellow-and-white **BORING DRIVEN DEVELOPMENT** (top-left).
  - Tagline: "Let your laziness and frustration guide your creativity in AI workflows."
  - Pacman + 4 small pellets in the upper-right corner.
  - Footer: "Jan Marek" (left), Mews wordmark (right).
- **Step 1** — Title texts and Mews logo fade out. At the same time, pacman
  and the 4 pellets slide from the upper-right down to the centre of the stage,
  laying out into a horizontal trail. (No Slack icon yet.)
- **Step 2** — Pacman moves right along the trail, eating the dots in sequence.
- **Step 3** — The Slack icon fades in just to the right of where the trail
  used to be — immediately after the dots are gone.
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
  goes back to empty. Narrative beat: never send it. **Advancing past this
  step cuts the slack window away and the jira scene flies in from the right
  on the same press** — slack disappearing and jira appearing happen together.

Each step is reversible with `←`. Continuous moves like the
pacman+dots travel are the recurring pattern for this presentation —
when adding scenes, prefer one merged scene with N step-keyed positions
over multiple scenes connected by hard cuts.

### 2. `jira` — 5 steps

Schematic Jira flow that follows the slack window from the title scene.
Same two-card aesthetic (dark-navy header plate + offwhite body plate).
The jira window flies in from the right on the same press that swaps out
the slack window — so the audience reads it as slack disappearing and
jira arriving together.

- **Step 0** — Backlog flies in from the right: header bar with "▣ Jira",
  "Growth · Backlog" crumbs, and a "+ Create" button; below it a list of
  ticket rows (key + summary bar + status pill).
- **Step 1** — "+ Create" button gets a focus ring; the create-issue
  modal scales in over the list.
- **Step 2** — Summary typewriter fills: _"tax field disappears on
  second submit"_ with a blue blinking cursor.
- **Step 3** — Required fields fill in staggered with per-field
  `transition-delay`: issue type → R&D team → story points → budget →
  labels → structured description (What & Why / Implementation /
  Acceptance criteria). The audience sees the "look at all this" beat
  unfold.
- **Step 4** — Jira window scales down and fades out — explicit disappear
  beat before the deck advances to `claude-arrival`. (Slack uses a
  fly-left exit; this exit uses scale-down so each scene's leave feels
  distinct.)

### 3. `claude-arrival` — 4 steps

Bridge scene from the jira backlog to the Claude code splash.

- **Step 0** — Pacman appears center-top of the stage, facing right.
- **Step 1** — Pacman rotates 90° to face down. At the same time, the
  Claude AI icon (the official rounded mark, sourced from Wikimedia,
  with a "CLAUDE" label below) scales in low in the stage, and a
  vertical trail of 3 small dots appears between pacman and the icon.
- **Step 2** — Pacman descends to the icon's position, eating each of
  the 3 dots in sequence on the way down. The icon scales out with a
  delayed transition timed to pacman's arrival — eaten. **On the same
  press**, the Claude code window scales in (delayed 0.8s so it lands
  after the icon vanishes), mac titlebar with traffic lights and
  "claude code" title, dark body, pixel-octopus mascot prominent in
  the middle with the "claude · tip: press / for commands" splash.
- **Step 3** — Holds the open window state (no further animation;
  hand-off slide for the speaker before the deck advances to
  `claude-work`).

### 4. `claude-work` — 6 steps

Same Claude code window, but now we drive it through the MCP flow that
motivates the next beat.

- **Step 0** — Idle terminal: pixel-octopus mark + "claude" brand on
  one row at the top.
- **Step 1** — Two MCP connections fire in cascade:
  `› /mcp slack connect` → ✓ Connected to slack-mcp →
  `› /mcp atlassian connect` → ✓ Connected to atlassian-mcp.
- **Step 2** — User prompt typewriter: _"create a jira ticket for the
  tax bug Petr reported in #product-feedback"_.
- **Step 3** — Claude works: `Read slack thread` → `Call
  Atlassian.createJiraIssue { project: "GRW", … }` → ✗ Error: missing
  required fields (labels / R&D team / story points / description
  sections).
- **Step 4** — User prompt typewriter: _"create a skill from how you
  learned creating jiras"_.
- **Step 5** — ✓ Saved `.claude/skills/jira-grw.md` · _"Use it next
  time — it'll fill the required fields and structure for you."_

### 5. `skill` — 1 step

VS Code-ish editor showing the saved skill file. Frontmatter (`name`,
`description`, `allowed-tools` including the Atlassian MCP calls used
in the previous scene, and `references` with saved ids like the GRW
project key, default R&D team, budget options, and Jan's Atlassian
account id), then body sections: When to use / Required fields /
Description template (the same What & Why / Implementation /
Acceptance criteria structure the jira modal demanded).

### 6. `github` — _(legacy, 1 step)_

GitHub PR mock from v1. Detailed (mac frame + repo bar + diff +
comment) — still in the deck so we can show the "ship it" beat
before the closing slide. Will eventually be re-done as a schematic
scene following the same aesthetic as the new ones.

### 7. `abstract` — _(closing slide, 1 step)_

The closing hook. Pink ghost above the heading, two-line statement
with "inspiration." in pink and "frustration." in yellow. No body
paragraph — the heading is the whole message. Pacman + two ghosts
in the bottom-right corner.

---

## How a scene is defined

Each scene is an object in the `scenes` array inside `scenes.js` (the
helpers and runtime live in `runtime.js` — see CLAUDE.md for the split):

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
- Shared helpers in `runtime.js`: `pacman(dir, size)`, `ghost(color, label, size)`,
  `appWindow({ variant, theme, … })`. Icons live in `icons/*.svg` and are
  referenced via `<img src="icons/foo.svg">` in render functions.

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
