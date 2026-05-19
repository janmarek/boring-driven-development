# Boring Driven Development

**Speaker:** Jan Marek · Mews
**Format:** HTML/CSS/JS presentation, Pac-Man-inspired
**Run:** open `index.html` in a browser
**Navigate:** `→` / `↓` / `Space` = forward · `←` / `↑` = back · `Home` / `End` = first / last
**Click:** right half of screen = next, left half = previous

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

| # | id            | One-line description |
|---|---------------|----------------------|
| 1 | `title`       | Title card. Pacman chomping dots, presenter line, Mews wordmark. |
| 2 | `abstract`    | The hook: frustration as a creative signal. |
| 3 | `map`         | The feature lifecycle drawn as a Pac-Man maze; the apps are ghosts. |
| 4 | `slack`       | Stage 1 — the request lands in `#product-feedback`. |
| 5 | `jira-list`   | Stage 2a — the new ticket inside an ocean of backlog. |
| 6 | `jira-create` | Stage 2b — writing the ticket. Boring form-fill. |
| 7 | `claude`      | Stage 3 — Claude CLI does the implementation. |
| 8 | `github`      | Stage 4 — the PR, opened and announced automatically. |
| 9 | `outro`       | Takeaway: pay attention to what bores you. |

---

## Scenes — detail

### 1. `title`

Opening card.

- Eyebrow line: "A talk by Jan Marek"
- Big yellow-and-white title: **BORING DRIVEN DEVELOPMENT**
- Tagline: "Let your laziness and frustration guide your creativity in AI workflows."
- Pacman chomping a row of pellets in the top-right.
- Footer: speaker name (left), Mews wordmark (right).

### 2. `abstract`

The hook. Sets up the rest of the talk.

- Kicker: "The idea"
- Headline: "Creativity in engineering doesn't always start with inspiration. Sometimes it starts with *frustration.*"
- Body: "What you don't feel like doing is your best signal for where to improve."
- Decoration: two ghosts being chased by Pacman in the bottom-right.

### 3. `map`

The metaphor in one image. The full lifecycle as a Pac-Man maze.

- Title: "The lifecycle of a feature"
- Maze drawn in Mews pink, with off-white dots and yellow power pellets.
- Pacman (you) starts top-left.
- Four ghosts mid-maze, each labelled with a stage: **Slack → Jira → Claude → GitHub**.
- Subtitles above each ghost: thread → ticket → code → PR.

### 4. `slack`

The request lands in Slack. We see the trigger — somebody asking for a feature.

- Window chrome with traffic-light buttons.
- Sidebar with channels, `#product-feedback` highlighted.
- Thread:
  - **Petr (PM):** "Guests keep asking for a way to split a bill across multiple cards…"
  - **Mara (Design):** "+1, third time this month. I have rough flows already."
  - **Jirka (Eng):** "Sounds like a ticket. @jan can you write it up?"
  - **Jan (me):** "…ugh, fine."
- Empty message box at the bottom.

This is the "I don't want to do this" moment.

### 5. `jira-list`

We open Jira and see why no one wants to write tickets — there are 247 of them.

- Jira top bar with logo and breadcrumb (`Projects / Growth / Backlog`).
- Backlog list with 8 sample issues.
- The new one (GRW-1405 — "Split bill across multiple cards") is highlighted in blue
  with an orange marker — that's *our* ticket.

### 6. `jira-create`

The actual ticket-creation form. The slow part.

- Standard Jira modal: Project, Issue type, Summary, Description, Budget, R&D team.
- The Summary and Description show typed-in content with a blinking caret.
- All the boilerplate fields a Mews ticket needs.

### 7. `claude`

Implementation, by Claude.

- Terminal window, claude-orange octopus mark, "claude code · v1.0" status bar.
- Lines of tool calls: `Read`, `Grep`, `Edit`, `Edit` — Claude navigating the codebase.
- Success line: ✓ Implemented multi-card split. Tests added. Branch ready.
- A new prompt being typed: `open a draft PR and tag the payments team`.

### 8. `github`

PR opened, reviewers tagged, announcement back in Slack — all automatically.

- GitHub topbar (black, Octocat mark, search).
- Repo header: `mews / mews-pms`, Pull requests tab active.
- PR title: **feat(payments): split bill across multiple cards #4821**
- "Open" badge in green.
- A short diff of `src/Payments/SplitPaymentBuilder.cs`.
- A `claude-bot` comment: linked the Jira ticket, generated the PR description,
  posted a summary to `#product-feedback`, tagged `@payments-team`.

### 9. `outro`

The single sentence to take home.

- Tag: "The takeaway"
- Headline: **Pay attention to what bores you.**
- Subtitle: "That's where the next workflow is hiding."
- Footer: little Pacman + "Jan Marek · Mews · @janmarek"

---

## Notes for adding scenes

Each scene lives in `script.js` as one object in the `scenes` array:

```js
{
  id: "kebab-case-id",         // appears in URL hash + slide counter
  notes: "one-liner for me",   // optional, ignored at runtime
  render: () => `<div class="scene">…</div>`,
}
```

- Always return a root element with `class="scene"` so it fills the stage.
- The runtime catches render errors and shows a fallback — navigation never breaks.
- Use the helpers at the top of `script.js`: `pacman()`, `ghost()`, `mazeSVG`,
  `claudeOctopus`.
- App-window scenes follow the same pattern:
  ```html
  <div class="app-window">
    <div class="app-titlebar">…</div>
    <div class="app-body …">…content…</div>
  </div>
  ```
- Brand palette is in CSS custom properties: `--pink --orange --yellow --ecru --blue
  --mauve --offwhite --black`.

---

## Assets

- `MEWS_WORDMARK_WHITE.png` — Mews logo, used in the title slide footer.
- `fonts/Söhne-*.otf` — primary typeface, mapped to weights 400–800 in `styles.css`.

## Things we might need later

- A screenshot of the real Claude CLI splash (currently faked in CSS/SVG).
- A real Slack-style emoji/reaction set if we want to add reactions.
- Actual screenshots of Jira / GitHub if we want pixel-accurate frames instead of
  the simplified versions.
