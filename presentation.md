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
| 1 | `title`         | 8     | Title → fade+center → pacman eats dot trail → Slack icon appears (notification badge auto-pops on top after a ~1s delay) → pacman eats notif → Slack window (bug report auto-slides in after ~1s delay) → composer+typing "please create a ticket in jira" → delete. Advance from the last step cuts straight to the jira scene flying in. |
| 2 | `jira`          | 4     | Schematic Mews Jira: detailed backlog flies in (Mews toolbar + table) → "+ Create" modal scales in → summary typewriter → required fields fill in stagger (type, team, story points, label chips one-by-one, structured description). Advancing past step 3 plays a 500ms scale-down + fade disappear before claude-arrival mounts (`exitDuration` + `.is-exiting`). |
| 3 | `claude-arrival`| 2     | Pacman center-top, auto-rotates to face down, then the 3-dot trail + Claude AI icon (with `CLAUDE` label) auto-appear with a delay. Step 1 = pacman descends along the trail and eats the icon. No window — claude-work's window does the scale-in entrance next with real terminal content. |
| 4 | `claude-work`   | 7     | Terminal flow: MCP connect (slack + atlassian) → user prompt "create a jira ticket…" → tool calls (Read slack thread, Call createJiraIssue) → error about required fields → user types the values ("ok — team is Checkin, story points 3, labels breakfast/pets") → ✓ Created MEWS-1409 → user prompt "create a skill from how you learned creating jiras" → ✓ saved. |
| 5 | `skill`         | 1     | VS Code-ish editor showing `.claude/skills/jira-mews.md` — frontmatter (name / description / allowed-tools / references with saved ids) and body (When to use / Required fields / Description template). |
| 6 | `github`        | 1     | GitHub **Open a pull request** screen — mac-frame window, GitHub navbar + repo bar, two-column body (title + description, sidebar with reviewers / assignees / labels). Fade-only exit (next scene is on black with no window). |
| 7 | `ghost-rules`   | 5     | Black bg. Pacman left, orange ghost right → ghost glides closer → speech bubble "You must create a ticket. PR needs a description." → coffee emoji appears below pacman → pacman rotates down, descends, eats coffee. |
| 8 | `claude-pr-flow`| 11    | Reuses the claude code window. Pre-existing turn ("pls fix bug" → ✓) visible. User bundles `commit, /jira-create, /create-pr` → claude tracks a 4-item plan that checks off one-by-one → 4 GitHub review-comment desktop notifications pop in top-right (Uncle Bob / Kent Beck / Martin Fowler stylistic nits) → user: "read review comments and fix when reasonable" → claude summary (fixed 2, skipped 2 nits) → user: "btw create a skill for it" → ✓ saved `pr-fix.md` → user: "pls update CLAUDE.md so I don't deal with this again" → ✓ updated. Transcript scrolls up at later steps. Wallpaper switches to the vivid XP variant (`xp-bliss-bg-xp.svg`) from this scene onward. |
| 9 | `boring-grid`   | 4     | Black bg + the XP-bliss wallpaper (kept from claude-pr-flow). On mount, kicks off a deliberately slow 10s crossfade of the wallpaper into sunset — the sky behind shifts from XP daytime to twilight while Jan talks through the obstacles, foreshadowing the incident response without an explicit scene change. Pacman top-left, alone → speech bubble fades in ("Coding is boring.") → 4×2 grid of obstacle ghosts pops in across two staggered rows: coding standards, architecture, unit tests, integration tests, observability, documentation, localization, feature flags. |
| 10| `claude-incident`| 12   | Merged editor + incident scene. Black bg throughout. Step 0 = VS Code editor on CLAUDE.md (sunset wallpaper). Step 1 = four slack incident alerts pile in over the editor (Coralogix / PagerDuty / Sentry / incident.io). Step 2 = editor slides off-left, terminal slides in from right, wallpaper crossfades sunset → blue-hour (onStep + window.setWallpaper). Steps 3–10 = mews-coralogix investigation (logs/trace/diff with a deliberate "claude is searching" delay) → diagnosis → user types "fix it" → Edit + ✓ Fixed → announce on `#engineering` → slack-announce draft + review → ✓ posted. Step 11 = four colleague thank-yous pop in. |
| 11| `takeaways`     | 4     | Black bg + new night wallpaper (dark sky, stars, crescent moon top-left, near-black hills) — even darker than the previous scene's blue-hour, so the deck deepens into full night for the closing beats. Pacman descends through three desserts (🍰 🍩 🍫); each bite reveals one summary takeaway: "Observe. Automate what you don't like." / "Automate what you just did and will happen again." / "Chain small skills and automations — create magic." |
| 12| `abstract`      | 1     | (closing slide) frustration-as-signal — pink ghost above the heading, "creativity." in pink, "enough." in yellow. Single pacman in the corner, no ghost trailing it. |

Legacy scenes removed in iter 11 (map, slack, jira-list, jira-create, claude
CLI) — the new scenes 2–5 cover the same ground.

---

## Scenes — detail

### 1. `title` — 8 steps

Opening card and the whole title → Slack flow, merged into one scene so the
pacman + dots persist as the same DOM elements throughout (smooth animation
across every beat). The "ask Claude instead" beat now lives in `claude-arrival`.
Two reveals — the notification badge and Petr's bug message — auto-appear
with a CSS `transition-delay` rather than consuming their own step, so the
speaker doesn't have to time them.

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
  used to be. **~1s later, a red notification badge auto-pops** onto the
  Slack icon's top-right corner — same press, no extra step.
- **Step 4** — Pacman moves diagonally up-right to that corner and eats the
  notification.
- **Step 5** — Pacman exits right; the Slack icon shrinks; the schematic
  `#product-feedback` window scales in at the centre. **~1s after the window
  lands, Petr's bug message auto-slides in**: _"hey, we have a bug. Guest
  tried to add breakfast for their dog and the system didn't allow it."_
  **~1.5s after the text**, a follow-up message from Petr appears with a
  photo attachment of the guest's dog — same step, longer transition-delay.
- **Step 6** — Composer (text input + green send button) slides up from the
  bottom of the Slack window. A blinking cursor appears and a typewriter
  animation reveals the reply, character by character: _"please create a
  ticket in jira"_.
- **Step 7** — The typed message is deleted (typewriter reversed). The input
  goes back to empty. Narrative beat: never send it. **Advancing past this
  step cuts the slack window away and the jira scene flies in from the right
  on the same press** — slack disappearing and jira appearing happen together.

Each step is reversible with `←`. Continuous moves like the
pacman+dots travel are the recurring pattern for this presentation —
when adding scenes, prefer one merged scene with N step-keyed positions
over multiple scenes connected by hard cuts.

### 2. `jira` — 4 steps + exit animation

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
- **Step 2** — Summary typewriter fills: _"guest can't add breakfast
  for their pet"_ with a blue blinking cursor.
- **Step 3** — Required fields fill in staggered with per-field
  `transition-delay`: issue type → R&D team → story points → budget →
  labels → structured description (What & Why / Implementation /
  Acceptance criteria). The audience sees the "look at all this" beat
  unfold.
- **Exit (no separate step)** — Advancing past step 3 sets `.is-exiting`
  on the scene root for 500ms (`exitDuration`), during which the window
  scales down and fades out before the DOM swap to claude-arrival.
  Avoids an empty "post-window" step in the HUD while still giving the
  audience a visible disappear.

### 3. `claude-arrival` — 2 steps

Bridge scene from the jira backlog to the claude code terminal. Just
the "pacman eats Claude" beat — the window itself appears in
`claude-work` with the real terminal content, not as an empty splash.
The setup (rotation + dots + icon) auto-plays on a CSS delay cascade
when the scene mounts, so the speaker only presses → once (for the
descent).

- **Step 0** — Pacman appears center-top, facing right. After the
  rAF apply, pacman auto-rotates 90° to face down (0.5s delay), then
  the vertical trail of 3 dots cascades in (1.1s delay), then the
  Claude AI icon (the rounded mark, with a "CLAUDE" label below)
  scales in low in the stage (1.4s delay). All without a press.
- **Step 1** — Pacman descends along the dot trail, eating each of
  the 3 dots in sequence on the way down. The icon scales out with a
  delayed transition timed to pacman's arrival — eaten.

Pressing → from step 1 mounts `claude-work`, whose window scale-in
entrance carries the audience into the next beat.

### 4. `claude-work` — 7 steps

Same Claude code window, but now we drive it through the MCP flow that
motivates the next beat.

- **Step 0** — Idle terminal: pixel-octopus mark + "claude" brand on
  one row at the top.
- **Step 1** — Two MCP connections fire in cascade:
  `› /mcp slack connect` → ✓ Connected to slack-mcp →
  `› /mcp atlassian connect` → ✓ Connected to atlassian-mcp.
- **Step 2** — User prompt typewriter: _"create a jira ticket for the
  pet breakfast complaint Petr forwarded in #product-feedback"_.
- **Step 3** — Claude works: `Read slack thread` → `Call
  Atlassian.createJiraIssue { project: "MEWS", … }` → ✗ Error: missing
  required fields (labels / R&D team / story points).
- **Step 4** — User prompt typewriter supplies the missing values:
  _"ok — team is Checkin, story points 3, labels breakfast/pets."_
  then `✓ Created MEWS-1409` lands after the typing finishes.
- **Step 5** — User prompt typewriter: _"create a skill from how you
  learned creating jiras"_.
- **Step 6** — ✓ Saved `.claude/skills/jira-mews.md`.

### 5. `skill` — 1 step

VS Code-ish editor showing the saved skill file. Frontmatter (`name`,
`description`, `allowed-tools` including the Atlassian MCP calls used
in the previous scene, and `references` with saved ids like the MEWS
project key, default R&D team, budget options, and a default assignee
id), then body sections: When to use / Required fields / Description
template (the same What & Why / Implementation / Acceptance criteria
structure the jira modal demanded).

### 6. `github` — (1 step + fade exit)

GitHub **Open a pull request** screen — the ship-it beat. Mac frame
window with the GitHub navbar (logo + search + nav) at the top, the
mews/mews-pms repo bar with the Pull-requests tab active, then the
page header "Open a pull request" with the compare-branches strip
(`main ← fix-pet-breakfast`). The body is a two-column layout: PR
title + structured description on the left (Summary / Test plan), and
a sidebar on the right with Reviewers (@checkin-team), Assignees
(jan-marek), and Labels. The big green "Create pull request" button
anchors the bottom.

Fade-only exit (the next scene `ghost-rules` is on a black background
with no window — nothing for the github window to slide toward).

### 7. `ghost-rules` — 5 steps

Bridge between github (review nags) and the next claude-pr-flow scene
(automate it). Black background, no window — just pacman, an orange
ghost, a speech bubble, and a cup of coffee.

- **Step 0** — Pacman center-left facing right; orange ghost far
  right (around `left: 1200`).
- **Step 1** — Ghost glides in closer to pacman (around `left: 820`),
  still on the right side.
- **Step 2** — A speech bubble fades in above the ghost: _"You must
  create a ticket. PR needs a description."_
- **Step 3** — A coffee mug (☕ emoji at 86px) appears below pacman.
- **Step 4** — Pacman rotates 90° to face down, descends to the
  coffee, and eats it (coffee shrinks with a delay timed to pacman's
  arrival). The bubble stays — the rule didn't go away, pacman just
  copes.

### 8. `claude-pr-flow` — 11 steps

The closing PMS workflow beat — automate the whole commit / Jira /
PR / review-handling / skill-creation / CLAUDE.md update loop. Reuses
the claude code window (mac-frame, terminal theme). Picks up from a
prior turn that's already visible on screen, so the audience reads it
as "claude has been doing this with me all along".

The transcript inner wrapper (`.pf-scroll`) translates upward at later
steps so the latest turn always lands within the visible viewport —
the same content scrolling pattern a real terminal uses.

- **Step 0** — Pre-existing turn visible: `› pls fix the bug` →
  `Read src/checkout/TaxField.tsx` → `Edit re-render tax line on
  second submit` → `✓ Fixed.`
- **Step 1** — User prompt typewriter: _"commit, /jira-create,
  /create-pr"_.
- **Step 2** — Claude prints a 4-item plan (all ◯ pending), items
  staggered in: commit changes → create jira issue → push branch →
  create PR via gh CLI.
- **Step 3** — Each task checks off (◯ → ✓ green) one-by-one with
  per-task `transition-delay`. Task text de-emphasises (opacity 0.6).
- **Step 4** — Four "GitHub" desktop notifications pop in from the
  right edge of the stage with stagger delays. Each one shows the
  GitHub mark, "GITHUB · 1m / 2m", "claude-bot commented on PR
  #1287", and a stylistic nit (prefer `const`, `forEach` → `map`,
  trailing newline, rename `data`).
- **Step 5** — User prompt typewriter: _"read review comments and fix
  when reasonable"_.
- **Step 6** — Notifications fade out to the right (claude is reading
  them). Claude summary: `Read 4 review comments from claude-bot on
  PR #1287` → `✓ Fixed 2 (missing semicolon, variable rename)` →
  `↷ Skipped 2 (forEach→map nit, ordering preference)`. Transcript
  starts scrolling up here so the older turns slide off the top.
- **Step 7** — User prompt typewriter: _"btw create a skill for it"_.
- **Step 8** — `✓ Saved .claude/skills/pr-fix.md`. Transcript scrolls
  again.
- **Step 9** — User prompt typewriter: _"pls update CLAUDE.md so I
  don't deal with this again"_.
- **Step 10** — `Edit CLAUDE.md · added "Coding standards" section`
  → `✓ Updated CLAUDE.md.` Transcript scrolls one last time.

Fade-only exit (last app window in the deck before the closing slide).

### 9. `boring-grid` — 4 steps

Wide shot of the development reality. Black bg + the same XP-bliss
wallpaper as claude-pr-flow on mount, so the handover from the
previous scene is just the same wallpaper continuing (the runtime
skips a same-file crossfade).

On mount, `onStep` kicks off a deliberately **slow 10-second
crossfade** of the wallpaper into the sunset variant via
`window.setWallpaper("…sunset.svg", 10000)`. The sky behind boring-grid
shifts from XP daytime to twilight while Jan talks through the
obstacles, foreshadowing the incident response without an explicit
scene change. By the time the bottom row of ghosts is on screen, the
hills are already warm reds and purples — the originally-green
observability ghost no longer clashes with grass-green grass because
the grass isn't grass any more. The next scene (claude-incident)
shares the matching `…sunset.svg` wallpaper, so its own mount call is
a no-op via the same-file skip.

- **Step 0** — Pacman alone at the upper-left.
- **Step 1** — Speech bubble fades in to pacman's right ("Coding is
  boring.") with a tail pointing left toward pacman.
- **Step 2** — Top row of 4 obstacle ghosts pops in with a stagger:
  **coding standards** (red), **architecture** (orange), **unit tests**
  (cyan), **integration tests** (pink). Labels uppercase below each
  with a soft dark text-shadow so they read on any band of the
  wallpaper as the sunset crossfade progresses.
- **Step 3** — Bottom row of 4 more: **observability** (green),
  **documentation** (purple), **localization** (amber), **feature
  flags** (indigo).

Obstacle list drawn from `mews-subscription-service/CLAUDE.md` — every
one of these is what a real PR has to clear before it can ship.

### 10. `claude-incident` — _(12 steps + fade exit)_

Merged scene combining the CLAUDE.md payoff with the incident
response. Black background throughout; the wallpaper crossfades
sunset → blue-hour mid-scene at the editor→terminal beat (driven by
`onStep` + the globally-exposed `window.setWallpaper`). One scene, two
windows, two notification stacks; the slack alerts visually persist
across the editor→terminal handoff.

- **Step 0** — Sunset wallpaper. VS Code editor opens `CLAUDE.md` in
  the project root and shows that every obstacle from the previous
  slide has its own documented section: **Coding standards**,
  **Architecture**, **Testing**, **Observability**, **Documentation**,
  **Code review**, **Feature flags**. (Reuses the `.skill .sk-*`
  styles via a `.skill` wrapper inside the editor body — not on the
  scene root, which would also match the terminal `.window`.)
- **Step 1** — Four slack-style incident notifications pop in
  top-right over the editor (white cards, slack mark, staggered):
  Coralogix bot in `#alerts` (P2: /checkin error rate), PagerDuty
  bot in `#oncall` (page Jan), Sentry bot in `#mews-pms`
  (NullReferenceException in BreakfastOrder.cs), incident.io bot in
  `#engineering` (Incident MEWS-2025-04 declared).
- **Step 2** — Editor slides off to the left; terminal slides in
  from the right; alerts stay visible during the handoff; wallpaper
  crossfades sunset → blue-hour.
- **Step 3** — Alerts fade out as claude starts working. User prompt
  typewriter: _"checkin is not loading, check what's going on in
  coralogix"_.
- **Step 4** — Claude invokes the `mews-coralogix` skill and runs
  three staggered investigations (logs, traces, git diff) with
  deliberately slow delays (0.8 / 1.5 / 2.2s) — the audience reads
  "claude is searching" before the lines land. Plain-English
  summaries: _"checkin is throwing a lot of errors"_, _"same error
  pattern across every failed request"_, _"PR #1287 touched the
  breakfast code right before things broke"_.
- **Step 5** — Diagnosis: _"Looks like config is missing which is
  throwing an error."_
- **Step 6** — User prompt typewriter: _"fix it"_.
- **Step 7** — `Edit · handle the missing-config case` → `✓ Fixed.
  Hotfix going out now.`
- **Step 8** — User prompt typewriter: _"announce on #engineering
  that it's resolved"_.
- **Step 9** — `slack-announce` skill drafts the message in a
  slack-quote-bar style box (🟢 Resolved · cause · hotfix · no
  customer impact). The channel reference uses a `.ci-channel` styled
  span (no code-pill padding) so trailing punctuation sits flush
  against the channel name. A `[Review draft — press → to send]`
  line gives the speaker a deliberate beat.
- **Step 10** — `✓ Posted to #engineering.`
- **Step 11** — Four colleague thank-you slack notifications pop in
  top-right over the terminal (Sarah / Michael / Emma / James, all in
  `#engineering`): _"you're a lifesaver 🙏"_, _"thanks, that was fast
  🚀"_, _"amazing work 🔥"_, _"🎉 thank you!"_.

Fade-only exit before the closing summary.

### 11. `takeaways` — _(4 steps)_

Traditional summary slide. Black bg + a new night wallpaper
(`icons/xp-bliss-bg-night.svg`) — darker than the blue-hour the
previous scene exits on, so the deck deepens into full night for the
closing beats. No headline — just pacman, three desserts
(🍰 🍩 🍫) stacked vertically, and the three takeaway sentences with
the load-bearing words highlighted (yellow / pink / orange). Pacman
descends; each bite reveals one sentence to its right. The reward
shrinks start ~0.20s into pacman's descent so the dessert is visibly
disappearing as pacman's mouth reaches it — eating, not just
teleporting. Pacman itself recolours per row to match the highlight:
yellow on the cake row (default), pink on the donut row, orange on
the chocolate row.

- **Step 0** — Pacman at top facing down; 🍰 🍩 🍫 visible; no
  takeaways yet.
- **Step 1** — Pacman descends to 🍰; cake shrinks under pacman's
  mouth; takeaway 1 fades in: _"**Observe.** Automate what you don't
  like."_ (yellow on "Observe")
- **Step 2** — Pacman descends to 🍩; donut shrinks; takeaway 2 fades
  in: _"Automate what you **just did** and will happen **again**."_
  ("just did" and "again" both highlighted in pink)
- **Step 3** — Pacman descends to 🍫; chocolate shrinks; takeaway 3
  fades in: _"**Chain** small skills and automations. Create magic."_
  ("Chain" highlighted in orange)

### 12. `abstract` — _(closing slide, 1 step)_

The closing punchline with a deck-driven pause. Two-line statement:
_"You don't need **creativity**."_ (pink emphasis) lands immediately;
_"Frustration is **enough**."_ (yellow emphasis on "enough") fades in
automatically ~1.2s later thanks to a CSS `transition-delay` keyed on
the scene's data-step. The speaker presses → once at the start and
the deck handles the comedic timing for them. The heading is centred
horizontally (line-height 1.35 so the two sentences breathe) to
balance against the pink ghost (top-left) and pacman
(bottom-right) corner anchors.

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
