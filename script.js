// Boring Driven Development — interactive presentation
// Pacman-flavored slideshow. Each scene is independent.
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

// ---------------------- Pacman maze ----------------------
// Coordinate system: 1480 x 660

const mazeSVG = `
  <svg viewBox="0 0 1480 660" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g stroke="var(--wall)" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#glow)">
      <!-- Outer frame -->
      <rect x="20" y="20" width="1440" height="620" rx="22" />
      <!-- Inner pieces -->
      <rect x="80" y="80"  width="240" height="120" rx="12" />
      <rect x="380" y="80" width="320" height="80"  rx="12" />
      <rect x="760" y="80" width="320" height="80"  rx="12" />
      <rect x="1140" y="80" width="240" height="120" rx="12" />

      <rect x="80"  y="260" width="200" height="60"  rx="12" />
      <rect x="340" y="260" width="120" height="160" rx="12" />
      <rect x="520" y="260" width="440" height="60"  rx="12" />
      <rect x="1020" y="260" width="120" height="160" rx="12" />
      <rect x="1200" y="260" width="200" height="60"  rx="12" />

      <rect x="80"  y="380" width="200" height="60"  rx="12" />
      <rect x="1200" y="380" width="200" height="60" rx="12" />

      <rect x="520" y="380" width="440" height="60"  rx="12" />

      <rect x="80"  y="500" width="320" height="80"  rx="12" />
      <rect x="460" y="500" width="120" height="80"  rx="12" />
      <rect x="640" y="500" width="200" height="80"  rx="12" />
      <rect x="900" y="500" width="120" height="80"  rx="12" />
      <rect x="1080" y="500" width="320" height="80" rx="12" />
    </g>
    <!-- Dots -->
    <g fill="var(--dot)">
      ${[
        [50, 50], [130, 50], [200, 50], [280, 50], [360, 50], [440, 50], [520, 50], [600, 50],
        [680, 50], [760, 50], [840, 50], [920, 50], [1000, 50], [1080, 50], [1160, 50],
        [1240, 50], [1320, 50], [1400, 50],
        [50, 230], [50, 350], [50, 470], [50, 605], [200, 605], [340, 605], [430, 605],
        [600, 605], [770, 605], [870, 605], [1050, 605], [1230, 605], [1430, 605],
        [1430, 470], [1430, 350], [1430, 230],
      ].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6"/>`).join("")}
    </g>
    <!-- Power pellets -->
    <g fill="var(--yellow)" opacity="0.85">
      <circle cx="50"  cy="120" r="12"/>
      <circle cx="1430" cy="120" r="12"/>
      <circle cx="50" cy="540" r="12"/>
      <circle cx="1430" cy="540" r="12"/>
    </g>
  </svg>
`;

// ---------------------- Scenes ----------------------

const scenes = [
  // 1 — Intro (merged title → slack flow, 7 steps)
  // Pacman + dots are the same DOM elements throughout, so the transition
  // from title to slack flow animates smoothly.
  {
    id: "title",
    notes:
      "Title → slack flow in one scene. 13 beats: title → fade+center → slack appears → eat dots → notify → eat notif → window → bug → composer+typing → delete → claude appears → pacman eats claude → slack flies left.",
    steps: 13,
    render: () => `
      <div class="scene intro">
        <!-- Title text overlay (fades out from step 1+) -->
        <div class="intro-titles">
          <h1 class="intro-h1">
            Boring<br/>Driven<br/>
            <span class="accent">Development</span>
          </h1>
          <p class="intro-tagline">
            Let your laziness and frustration<br/>
            guide your creativity in AI workflows.
          </p>
          <div class="intro-footer">
            <div class="intro-author">Jan Marek</div>
            <div class="intro-mews">
              <img src="MEWS_WORDMARK_WHITE.png" alt="Mews"/>
            </div>
          </div>
        </div>

        <!-- Slack icon (appears at step 1, lives at right side, shrinks at step 5) -->
        <div class="intro-slack">
          <div class="slack-mark"><img src="icons/slack-mark.svg" alt="Slack"/></div>
          <div class="intro-slack-label">slack</div>
        </div>

        <!-- Notification badge on the top-right corner of the slack icon -->
        <div class="intro-badge">1</div>

        <!-- Schematic Slack window (scales in at step 5) -->
        <div class="intro-window">
          <div class="sw-header">
            <span class="sw-hash">#</span>
            <span>product-feedback</span>
          </div>
          <div class="sw-body">
            <div class="sw-msg">
              <div class="sw-avatar"></div>
              <div class="sw-bubble">
                <div class="sw-line"></div>
                <div class="sw-line mid"></div>
              </div>
            </div>
            <div class="sw-msg">
              <div class="sw-avatar"></div>
              <div class="sw-bubble">
                <div class="sw-line short"></div>
              </div>
            </div>
            <div class="sw-msg new-msg">
              <div class="sw-avatar"></div>
              <div class="sw-bubble">
                <div class="sw-name">Petr · PM</div>
                <div class="sw-text">hey, found a bug 🐛 — the tax field disappears on second submit.</div>
              </div>
            </div>
            <!-- Composer: appears at step 8, types message, deletes at step 9 -->
            <div class="sw-composer">
              <div class="sw-input">
                <span class="sw-typing"><span class="sw-typed-text">please create a ticket in jira</span></span><span class="sw-cursor"></span>
              </div>
              <button class="sw-send" aria-label="Send">
                <img src="icons/send-arrow.svg" alt=""/>
              </button>
            </div>
          </div>
        </div>

        <!-- Claude octopus (appears at step 10, eaten at step 11) -->
        <div class="intro-claude">
          <img class="claude-logo-svg" src="icons/claude-octopus.svg" alt=""/>
          <div class="intro-claude-label">claude</div>
        </div>

        <!-- 4 dots: title pellets in step 0, trail in step 1, eaten in step 2+ -->
        <div class="intro-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>

        <!-- Pacman traveler (persists across all steps) -->
        <div class="intro-pacman">${pacman("right", 84)}</div>
      </div>
    `,
  },

  // 2 — Jira flow (schematic). 5 beats:
  //   0 — backlog flies in from the right
  //   1 — "+ Create" → create-issue modal scales in
  //   2 — summary typewriter fills
  //   3 — tedious required fields fill in staggered (type, team, story
  //       points, labels, structured description) → "look at all this"
  //   4 — jira window flies off the left
  {
    id: "jira",
    notes:
      "Schematic Jira: backlog → create modal → struggle filling fields → fly left. Same two-card aesthetic as the slack window in the title scene.",
    steps: 5,
    render: () => `
      <div class="scene jira">
        <div class="jira-window">
          <div class="jw-header">
            <div class="jw-mews">
              <img src="MEWS_WORDMARK_WHITE.png" alt="Mews"/>
            </div>
            <div class="jw-search">
              <img src="icons/search.svg" alt=""/>
              <span>Search</span>
            </div>
            <button class="jw-create">+ Create</button>
            <div class="jw-profile">JM</div>
          </div>
          <div class="jw-body">
            <div class="jw-list-head">
              <h2>Backlog · 247 issues</h2>
              <span class="jw-meta">Showing 8 of 247</span>
            </div>
            <div class="jw-table">
              <div class="jw-trow jw-thead">
                <div>Key</div><div>Summary</div><div>Type</div><div>Status</div><div>Assignee</div>
              </div>
              ${[
                ["GRW-1408", "Add CSV export for revenue report", "task", "todo", "—"],
                ["GRW-1407", "Tax field disappears on second submit", "bug", "progress", "Karel"],
                ["GRW-1406", "Welcome email link broken (German)", "bug", "review", "Mara"],
                ["GRW-1405", "Split bill across multiple cards", "task", "todo", "Jan", true],
                ["GRW-1404", "Refactor reservation hooks", "task", "progress", "Tom"],
                ["GRW-1403", "Investigate timeout in checkout", "bug", "todo", "—"],
                ["GRW-1402", "Translate onboarding screens", "task", "done", "Mara"],
                ["GRW-1401", "Dark mode for Commander", "task", "todo", "—"],
              ]
                .map(
                  ([key, sum, type, status, ass, highlight]) => `
                    <div class="jw-trow ${highlight ? "is-highlight" : ""}">
                      <div class="jw-key">${key}</div>
                      <div>${sum}</div>
                      <div class="jw-type"><span class="jw-type-icon jw-type-${type}"></span>${type === "bug" ? "Bug" : "Task"}</div>
                      <div><span class="jw-status ${status}">${
                        { todo: "To Do", progress: "In Progress", review: "In Review", done: "Done" }[status]
                      }</span></div>
                      <div>${ass}</div>
                    </div>`
                )
                .join("")}
            </div>
            <!-- Modal: appears at step 1 over the list -->
            <div class="jw-modal">
              <div class="jw-modal-header">
                <span>Create issue</span>
                <span class="jw-x">×</span>
              </div>
              <div class="jw-modal-body">
                <div class="jw-field jw-field-summary">
                  <label>Summary <span class="req">*</span></label>
                  <div class="jw-input"><span class="jw-typing-wrap"><span class="jw-typed">tax field disappears on second submit</span></span><span class="jw-cursor"></span></div>
                </div>
                <div class="jw-grid">
                  <div class="jw-field jw-field-type">
                    <label>Issue type <span class="req">*</span></label>
                    <div class="jw-select"><span class="jw-fill"><span class="jw-type-icon jw-type-bug"></span><span>Bug</span></span></div>
                  </div>
                  <div class="jw-field jw-field-team">
                    <label>R&amp;D team <span class="req">*</span></label>
                    <div class="jw-select"><span class="jw-fill"><span>Ecosystem Experience</span></span></div>
                  </div>
                  <div class="jw-field jw-field-points">
                    <label>Story points <span class="req">*</span></label>
                    <div class="jw-select"><span class="jw-fill"><span>3</span></span></div>
                  </div>
                </div>
                <div class="jw-field jw-field-labels">
                  <label>Labels <span class="req">*</span></label>
                  <div class="jw-select"><span class="jw-chip">payments</span><span class="jw-chip">tax</span><span class="jw-chip">bug-bash</span></div>
                </div>
                <div class="jw-field jw-field-desc">
                  <label>Description <span class="req">*</span></label>
                  <div class="jw-textarea"><span class="jw-fill"><span class="jw-line jw-line-h">**What &amp; Why**</span><span class="jw-line">Tax field disappears on second submit during checkout —</span><span class="jw-line">guest can't pay, support tickets piling up.</span><span class="jw-line jw-line-h">**Implementation suggestions**</span><span class="jw-line">Inspect CheckoutFlow state machine, re-render on resubmit.</span><span class="jw-line jw-line-h">**Acceptance criteria**</span><span class="jw-line">• Tax line visible on every submit attempt</span><span class="jw-line">• Regression test for double-submit</span></span></div>
                </div>
              </div>
              <div class="jw-modal-footer">
                <button class="jw-btn">Cancel</button>
                <button class="jw-btn primary">Create</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // 3 — Claude arrival (4 steps).
  //   0 — pacman appears center-top facing right (no rotation yet)
  //   1 — pacman rotates 90° to face down; Claude AI icon scales in
  //       at the centre below it
  //   2 — pacman descends to icon position; icon scales out with a
  //       delayed transition timed to pacman's arrival (eaten)
  //   3 — Claude code window scales in (frame variant + terminal theme)
  //       with the pixel-octopus mascot and "claude" branding inside
  {
    id: "claude-arrival",
    notes:
      "Pacman descends, eats Claude AI icon, Claude code window appears with the pixel octopus.",
    steps: 4,
    render: () => `
      <div class="scene claude-arrival">
        <div class="ca-pacman">${pacman("right", 84)}</div>
        <div class="ca-icon"><img src="icons/claude-ai-icon.svg" alt=""/></div>
        ${appWindow({
          variant: "frame",
          theme: "terminal",
          title: "claude code",
          width: 1100,
          height: 720,
          body: `
            <div class="ca-claude-body">
              <div class="ca-octopus"><img src="icons/pixel-octopus.svg" alt=""/></div>
              <div class="ca-claude-text">
                <h2>claude</h2>
                <p>tip: press <kbd>/</kbd> for commands</p>
              </div>
            </div>
          `,
        })}
      </div>
    `,
  },

  // 4 — Claude at work in the terminal. Same window as claude-arrival.
  //   0 — idle terminal with pixel-octopus mark + empty prompt
  //   1 — MCP connection lines (/mcp atlassian connect → ✓ Connected)
  //   2 — user prompt typewriter: "create a jira ticket for the tax
  //       bug Petr reported in #product-feedback"
  //   3 — claude works: Read slack thread → Call Atlassian.createJiraIssue
  //       → ✗ Error: missing required fields (labels, team, …)
  //   4 — user prompt typewriter: "create a skill from how you
  //       learned creating jiras"
  //   5 — ✓ Saved .claude/skills/jira-grw.md confirmation
  {
    id: "claude-work",
    notes:
      "Terminal flow: MCP → create-issue → error about missing required fields → ask for a skill → skill saved.",
    steps: 6,
    render: () => `
      <div class="scene cw">
        ${appWindow({
          variant: "frame",
          theme: "terminal",
          title: "claude code",
          width: 1280,
          height: 760,
          body: `
            <div class="cw-screen">
              <div class="cw-splash">
                <img class="cw-mark" src="icons/pixel-octopus.svg" alt=""/>
                <span class="cw-brand">claude</span>
                <span class="cw-tip">tip: press <kbd>/</kbd> for commands</span>
              </div>
              <div class="cw-transcript">
                <div class="cw-line cw-line-mcp1">› /mcp atlassian connect</div>
                <div class="cw-line cw-line-mcp2"><span class="cw-ok">✓</span> Connected to atlassian-mcp — 7 tools available</div>

                <div class="cw-line cw-line-p1">
                  <span class="cw-arrow">›</span>
                  <span class="typewriter cw-tw-1"><span>create a jira ticket for the tax bug Petr reported in #product-feedback</span></span>
                </div>

                <div class="cw-line cw-line-w1"><span class="tool">Read</span><span class="cw-muted">slack thread #product-feedback — Petr's bug message</span></div>
                <div class="cw-line cw-line-w2"><span class="tool">Call</span><span class="cw-muted">Atlassian.createJiraIssue { project: "GRW", summary: "Tax field disappears…", type: "Bug" }</span></div>
                <div class="cw-line cw-line-w3"><span class="cw-err">✗</span> <span class="cw-err-text">Error from atlassian-mcp · missing required fields:</span></div>
                <div class="cw-line cw-line-w4 cw-indent"><span class="cw-err-text">labels · R&amp;D team · story points · description sections (What &amp; Why / Implementation / Acceptance)</span></div>

                <div class="cw-line cw-line-p2">
                  <span class="cw-arrow">›</span>
                  <span class="typewriter cw-tw-2"><span>create a skill from how you learned creating jiras</span></span>
                </div>

                <div class="cw-line cw-line-s1"><span class="cw-ok">✓</span> Saved <code>.claude/skills/jira-grw.md</code></div>
                <div class="cw-line cw-line-s2 cw-indent cw-muted">Use it next time — it'll fill the required fields and structure for you.</div>
              </div>
              <div class="cw-input">
                <span class="cw-arrow">›</span>
                <span class="cw-placeholder">Type a message…</span>
                <span class="cursor is-on"></span>
              </div>
            </div>
          `,
        })}
      </div>
    `,
  },

  // 5 — Skill markdown opened in a VS Code-ish editor. The saved
  //   .claude/skills/jira-grw.md the previous scene confirmed exists.
  //   One step for now — speaker walks the audience through it.
  {
    id: "skill",
    notes:
      "VS Code editor showing the saved jira-grw skill: frontmatter (tools used, saved ids), When to use, required fields, description template.",
    steps: 1,
    render: () => `
      <div class="scene skill">
        ${appWindow({
          variant: "frame",
          theme: "editor",
          title: "jira-grw.md — claude code",
          width: 1300,
          height: 780,
          body: `
            <div class="sk-editor">
              <div class="sk-sidebar">
                <div class="sk-side-header">Explorer</div>
                <div class="sk-tree">
                  <div class="sk-tree-folder">▾ .claude</div>
                  <div class="sk-tree-folder sk-indent">▾ skills</div>
                  <div class="sk-tree-file sk-indent-2 sk-active">jira-grw.md</div>
                  <div class="sk-tree-folder">▸ src</div>
                  <div class="sk-tree-folder">▸ tests</div>
                  <div class="sk-tree-file">README.md</div>
                  <div class="sk-tree-file">package.json</div>
                </div>
              </div>
              <div class="sk-tabs">
                <div class="sk-tab sk-active">jira-grw.md <span class="sk-x">×</span></div>
              </div>
              <div class="sk-code">
                <div class="sk-gutter">
                  ${Array.from({ length: 38 }, (_, i) => `<div>${i + 1}</div>`).join("")}
                </div>
                <div class="sk-content">
                  <div class="sk-line"><span class="sk-meta">---</span></div>
                  <div class="sk-line"><span class="sk-key">name</span>: jira-grw</div>
                  <div class="sk-line"><span class="sk-key">description</span>: Create well-structured Jira issues in the <span class="sk-str">GRW</span> project with the required fields and Ecosystem Experience team practices.</div>
                  <div class="sk-line"><span class="sk-key">allowed-tools</span>:</div>
                  <div class="sk-line">  - Atlassian.createJiraIssue</div>
                  <div class="sk-line">  - Atlassian.lookupJiraAccountId</div>
                  <div class="sk-line">  - Atlassian.searchJiraIssuesUsingJql</div>
                  <div class="sk-line"><span class="sk-key">references</span>:</div>
                  <div class="sk-line">  <span class="sk-key">project_key</span>: <span class="sk-str">GRW</span></div>
                  <div class="sk-line">  <span class="sk-key">default_team</span>: <span class="sk-str">Ecosystem Experience</span></div>
                  <div class="sk-line">  <span class="sk-key">budget_options</span>: [<span class="sk-str">KTLO</span>, <span class="sk-str">Scale</span>, <span class="sk-str">Strategy</span>]</div>
                  <div class="sk-line">  <span class="sk-key">jan_account_id</span>: <span class="sk-str">712020:e2c4f1bb…</span></div>
                  <div class="sk-line"><span class="sk-meta">---</span></div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h1"># Jira GRW</span></div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## When to use</span></div>
                  <div class="sk-line">When the user asks to create a GRW ticket — "new GRW issue",</div>
                  <div class="sk-line">"jira grw", "create a ticket for &lt;bug&gt;", etc.</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Required fields</span></div>
                  <div class="sk-line">- <span class="sk-em">Summary</span> — concise, imperative</div>
                  <div class="sk-line">- <span class="sk-em">Issue type</span> — Bug | Task | Story</div>
                  <div class="sk-line">- <span class="sk-em">R&amp;D team</span> — defaults to "Ecosystem Experience"</div>
                  <div class="sk-line">- <span class="sk-em">Story points</span> — 1, 2, 3, 5, 8</div>
                  <div class="sk-line">- <span class="sk-em">Labels</span> — at least one (e.g. payments, tax, bug-bash)</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Description template</span></div>
                  <div class="sk-line"><span class="sk-bold">**What &amp; Why**</span></div>
                  <div class="sk-line">&lt;one-paragraph problem statement&gt;</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-bold">**Implementation suggestions**</span></div>
                  <div class="sk-line">&lt;one-paragraph approach&gt;</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-bold">**Acceptance criteria**</span></div>
                  <div class="sk-line">- …</div>
                  <div class="sk-line">- …</div>
                </div>
              </div>
              <div class="sk-statusbar">
                <span>● main</span>
                <span>UTF-8</span>
                <span>LF</span>
                <span>Markdown</span>
                <span class="sk-spacer"></span>
                <span>Ln 1, Col 1</span>
              </div>
            </div>
          `,
        })}
      </div>
    `,
  },

  // 6 — Abstract / hook
  {
    id: "abstract",
    notes: "The core idea. Frustration as a signal.",
    render: () => `
      <div class="scene abstract-scene">
        <div class="abstract-kicker">The idea</div>
        <h2 class="abstract-h2">
          Creativity in engineering doesn't always start with inspiration.<br/>
          Sometimes it starts with <em>frustration.</em>
        </h2>
        <p class="abstract-body">
          What you don't feel like doing is your best signal for where to improve.
          You don't need to be a naturally creative person — you just need to pay
          attention to what bores you.
        </p>
        <div style="position:absolute; right:120px; bottom:120px; display:flex; gap:30px; align-items:center;">
          ${ghost("var(--orange)", "")}
          ${ghost("var(--pink)", "")}
          ${pacman("right", 90)}
        </div>
      </div>
    `,
  },

  // 3 — The map: lifecycle as a pacman maze
  {
    id: "map",
    notes: "The lifecycle of a feature, as a pacman map. Apps are ghosts.",
    render: () => `
      <div class="scene map-scene">
        <div class="map-title">
          <h2>The lifecycle of a feature</h2>
          <div class="legend">Eat the boring dots →</div>
        </div>
        <div class="maze">
          ${mazeSVG}
          <!-- Pacman at start -->
          <div class="pacman-on-maze" style="left:60px; top:120px;">${pacman("right", 70)}</div>

          <!-- Ghosts placed along the route -->
          <div class="ghost" style="left:520px; top:330px;">
            ${ghost("var(--blue)", "Slack")}
          </div>
          <div class="ghost" style="left:780px; top:330px;">
            ${ghost("var(--pink)", "Jira")}
          </div>
          <div class="ghost" style="left:1040px; top:330px;">
            ${ghost("var(--orange)", "Claude")}
          </div>
          <div class="ghost" style="left:1290px; top:330px;">
            ${ghost("var(--yellow)", "GitHub")}
          </div>

          <!-- Stage labels -->
          <div class="maze-label" style="left:520px; top:230px;">1. Thread<span class="sub">"we should..."</span></div>
          <div class="maze-label" style="left:780px; top:230px;">2. Ticket<span class="sub">create + groom</span></div>
          <div class="maze-label" style="left:1040px; top:230px;">3. Code<span class="sub">implement</span></div>
          <div class="maze-label" style="left:1290px; top:230px;">4. PR<span class="sub">review + ship</span></div>
        </div>
      </div>
    `,
  },

  // 4 — Slack thread
  {
    id: "slack",
    notes: "Stage 1: it starts in Slack.",
    render: () => `
      <div class="scene">
        <div class="app-window">
          <div class="app-titlebar">
            <div class="traffic"><span></span><span></span><span></span></div>
            <div class="title">Slack — #product-feedback</div>
          </div>
          <div class="app-body slack">
            <div class="slack-sidebar">
              <div class="slack-workspace">Mews</div>
              <div class="slack-channel">#general</div>
              <div class="slack-channel">#eng-platform</div>
              <div class="slack-channel active"># product-feedback</div>
              <div class="slack-channel">#random</div>
              <div class="slack-channel">#oncall</div>
            </div>
            <div class="slack-main">
              <div class="slack-header"># product-feedback</div>
              <div class="slack-thread">
                <div class="slack-msg">
                  <div class="slack-avatar">P</div>
                  <div class="slack-body">
                    <div class="slack-meta"><span class="slack-name">Petr (PM)</span><span class="slack-time">9:42 AM</span></div>
                    <div class="slack-text">Guests keep asking for a way to split a bill across multiple cards. Can someone take a look? 🙏</div>
                  </div>
                </div>
                <div class="slack-msg from-mara">
                  <div class="slack-avatar">M</div>
                  <div class="slack-body">
                    <div class="slack-meta"><span class="slack-name">Mara (Design)</span><span class="slack-time">9:45 AM</span></div>
                    <div class="slack-text">+1, third time this month. I have rough flows already.</div>
                  </div>
                </div>
                <div class="slack-msg from-jirka">
                  <div class="slack-avatar">J</div>
                  <div class="slack-body">
                    <div class="slack-meta"><span class="slack-name">Jirka (Eng)</span><span class="slack-time">9:51 AM</span></div>
                    <div class="slack-text">Sounds like a ticket. <code>@jan</code> can you write it up?</div>
                  </div>
                </div>
                <div class="slack-msg">
                  <div class="slack-avatar">Y</div>
                  <div class="slack-body">
                    <div class="slack-meta"><span class="slack-name">Jan (me)</span><span class="slack-time">9:53 AM</span></div>
                    <div class="slack-text" style="color:#fff;">…ugh, fine.</div>
                  </div>
                </div>
              </div>
              <div class="slack-input">Message #product-feedback…</div>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // 5 — Jira issue list
  {
    id: "jira-list",
    notes: "Stage 2a: an ocean of tickets. Where does mine go?",
    render: () => `
      <div class="scene">
        <div class="app-window">
          <div class="app-titlebar">
            <div class="traffic"><span></span><span></span><span></span></div>
            <div class="title">Jira — GRW board</div>
          </div>
          <div class="app-body">
            <div class="jira-list">
              <div class="jira-topbar">
                <div class="jira-logo">Jira</div>
                <div class="jira-crumbs">Projects / <strong>Growth</strong> / Backlog</div>
                <div style="flex:1"></div>
                <div class="jira-controls">
                  <button class="jira-btn">Filters</button>
                  <button class="jira-btn primary">+ Create</button>
                </div>
              </div>
              <div class="jira-content">
                <div class="row" style="justify-content:space-between">
                  <h1 class="jira-h1">Backlog · 247 issues</h1>
                  <div style="color:#5e6c84; font-size:13px;">Showing 8 of 247</div>
                </div>
                <div class="jira-table">
                  <div class="jira-row header">
                    <div>Key</div><div>Summary</div><div>Type</div><div>Status</div><div>Assignee</div>
                  </div>
                  ${[
                    ["GRW-1408", "Add CSV export for revenue report", "task", "todo", "—"],
                    ["GRW-1407", "Tax field disappears on second submit", "bug", "progress", "Karel"],
                    ["GRW-1406", "Welcome email link broken (German)", "bug", "review", "Mara"],
                    ["GRW-1405", "Split bill across multiple cards", "task", "todo", "Jan", true],
                    ["GRW-1404", "Refactor reservation hooks", "task", "progress", "Tom"],
                    ["GRW-1403", "Investigate timeout in checkout", "bug", "todo", "—"],
                    ["GRW-1402", "Translate onboarding screens", "task", "done", "Mara"],
                    ["GRW-1401", "Dark mode for Commander", "task", "todo", "—"],
                  ]
                    .map(
                      ([key, sum, type, status, ass, highlight]) => `
                    <div class="jira-row ${highlight ? "highlight" : ""}">
                      <div class="jira-key">${key}</div>
                      <div>${sum}</div>
                      <div><span class="jira-type"><span class="jira-type-icon ${type}"></span>${
                        type === "bug" ? "Bug" : "Task"
                      }</span></div>
                      <div><span class="jira-status ${status}">${
                        { todo: "To Do", progress: "In Progress", review: "In Review", done: "Done" }[status]
                      }</span></div>
                      <div>${ass}</div>
                    </div>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // 6 — Jira create issue form
  {
    id: "jira-create",
    notes: "Stage 2b: writing the ticket. The most boring 8 minutes of the day.",
    render: () => `
      <div class="scene">
        <div class="app-window">
          <div class="app-titlebar">
            <div class="traffic"><span></span><span></span><span></span></div>
            <div class="title">Jira — Create issue</div>
          </div>
          <div class="app-body">
            <div class="jira-form">
              <div class="jira-topbar">
                <div class="jira-logo">Jira</div>
                <div class="jira-crumbs">Projects / <strong>Growth</strong> / Create issue</div>
              </div>
              <div class="jira-modal">
                <div class="jira-modal-header">
                  <h3>Create issue</h3>
                  <span class="x">×</span>
                </div>
                <div class="jira-modal-sub">Required fields are marked with <span style="color:#de350b">*</span></div>
                <div class="jira-modal-body">
                  <div class="jira-field">
                    <label>Project <span class="req">*</span></label>
                    <div class="jira-select">Growth (GRW)</div>
                  </div>
                  <div class="jira-field">
                    <label>Issue type <span class="req">*</span></label>
                    <div class="jira-select">▣ Task</div>
                  </div>
                  <div class="jira-field">
                    <label>Summary <span class="req">*</span></label>
                    <div class="jira-input focus jira-typing">Split bill across multiple cards</div>
                  </div>
                  <div class="jira-field">
                    <label>Description</label>
                    <div class="jira-textarea focus">
                      <span>Guests should be able to split a single check across<br/>two or more payment cards at checkout.<br/><br/>Acceptance criteria:<br/>• At least 2 cards supported<br/>• Partial amount per card<br/>• Receipt reflects breakdown</span>
                    </div>
                  </div>
                  <div class="jira-field">
                    <label>Budget <span class="req">*</span></label>
                    <div class="jira-select">Strategy</div>
                  </div>
                  <div class="jira-field">
                    <label>R&amp;D team <span class="req">*</span></label>
                    <div class="jira-select">Ecosystem Experience</div>
                  </div>
                </div>
                <div class="jira-modal-footer">
                  <button class="jira-btn">Cancel</button>
                  <button class="jira-btn primary">Create</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // 7 — Claude CLI
  {
    id: "claude",
    notes: "Stage 3: implementation. Let Claude do the boring part.",
    render: () => `
      <div class="scene">
        <div class="app-window">
          <div class="app-titlebar">
            <div class="traffic"><span></span><span></span><span></span></div>
            <div class="title">claude — ~/projects/mews</div>
          </div>
          <div class="app-body claude">
            <div class="claude-bar">claude code · v1.0 · /Users/jan/projects/mews</div>
            <div class="claude-screen">
              <div class="claude-logo">
                <img class="claude-logo-svg" src="icons/claude-octopus.svg" alt=""/>
                <div class="claude-logo-text">claude<small>tip: press / for commands</small></div>
              </div>
              <div class="claude-line claude-muted">› Implementing GRW-1405 — split bill across multiple cards.</div>
              <div class="claude-line">
                <span class="tool">Read</span>
                <span class="claude-muted">src/Payments/CheckoutFlow.cs · 412 lines</span>
              </div>
              <div class="claude-line">
                <span class="tool">Grep</span>
                <span class="claude-muted">"PaymentMethod" → 38 matches across 11 files</span>
              </div>
              <div class="claude-line">
                <span class="tool">Edit</span>
                <span class="claude-muted">src/Payments/CheckoutFlow.cs · +124 −18</span>
              </div>
              <div class="claude-line">
                <span class="tool">Edit</span>
                <span class="claude-muted">src/Payments/SplitPaymentBuilder.cs · new file, 86 lines</span>
              </div>
              <div class="claude-line claude-response">
                ✓ Implemented multi-card split. Tests added. Branch <strong>grw-1405-split-bill</strong> ready.
              </div>
              <div class="claude-prompt">
                <span class="claude-prompt-arrow">›</span>
                <span class="claude-prompt-text typing">open a draft PR and tag the payments team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // 8 — GitHub PR
  {
    id: "github",
    notes: "Stage 4: ship it.",
    render: () => `
      <div class="scene">
        <div class="app-window">
          <div class="app-titlebar">
            <div class="traffic"><span></span><span></span><span></span></div>
            <div class="title">GitHub — mews-pms/pulls/4821</div>
          </div>
          <div class="app-body">
            <div class="github">
              <div class="github-topbar">
                <div class="github-mark"></div>
                <div class="github-search">Type / to search</div>
                <div style="flex:1"></div>
                <div style="color:rgba(255,255,255,.7); font-size:13px;">Pull requests · Issues · Marketplace</div>
              </div>
              <div class="github-body">
                <div class="github-repo-bar">
                  <div class="github-repo-name">mews <span class="slash">/</span> <strong>mews-pms</strong></div>
                  <div class="github-tabs">
                    <div class="github-tab">Code</div>
                    <div class="github-tab">Issues</div>
                    <div class="github-tab active">Pull requests <span style="background:#ddf4ff;color:#0969da;padding:0 6px;border-radius:10px;font-size:11px;margin-left:4px">12</span></div>
                    <div class="github-tab">Actions</div>
                    <div class="github-tab">Projects</div>
                  </div>
                </div>
                <div class="github-pr">
                  <div class="github-pr-title">
                    feat(payments): split bill across multiple cards
                    <span class="num">#4821</span>
                  </div>
                  <div class="github-pr-meta">
                    <span class="github-state">Open</span>
                    <strong>jan-marek</strong> wants to merge 3 commits into <code style="background:#f6f8fa;padding:2px 6px;border-radius:4px;">main</code> from <code style="background:#f6f8fa;padding:2px 6px;border-radius:4px;">grw-1405-split-bill</code>
                  </div>
                  <div class="github-files">
                    <div class="github-file-header">
                      <span class="github-file-name">src/Payments/SplitPaymentBuilder.cs</span>
                      <span style="color:#1a7f37">+86</span>
                    </div>
                    <div class="github-diff">
                      <div class="github-line add">public sealed class SplitPaymentBuilder</div>
                      <div class="github-line ctx">{</div>
                      <div class="github-line add">    private readonly List&lt;CardAllocation&gt; allocations = new();</div>
                      <div class="github-line add">    public SplitPaymentBuilder Add(Card card, Money amount) {</div>
                      <div class="github-line add">        allocations.Add(new(card, amount));</div>
                      <div class="github-line add">        return this;</div>
                      <div class="github-line add">    }</div>
                      <div class="github-line ctx">}</div>
                    </div>
                  </div>
                  <div class="github-comment bot">
                    <div class="avatar">C</div>
                    <div class="github-comment-body">
                      <div><span class="name">claude-bot</span><span class="when">just now</span></div>
                      <div>
                        Linked GRW-1405 · Generated PR description from commits · Posted summary to <code>#product-feedback</code>.
                        Reviewers: <strong>@payments-team</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // 9 — Outro
  {
    id: "outro",
    notes: "The takeaway.",
    render: () => `
      <div class="scene outro-scene">
        <div class="outro-tag">The takeaway</div>
        <h1 class="outro-h1">
          Pay attention to<br/>
          what <span class="yellow">bores you.</span>
        </h1>
        <p class="outro-sub">
          That's where the next workflow is hiding.
        </p>
        <div class="outro-footer">
          ${pacman("right", 36)}
          <span>Jan Marek · Mews · @janmarek</span>
        </div>
      </div>
    `,
  },
];

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
const counterEl = document.getElementById("counter");

let sceneIndex = 0;
let stepIndex = 0;

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
  try { history.replaceState(null, "", `#${scene.id}`); } catch (_) {}
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
  const scene = scenes[sceneIndex];
  if (stepIndex < stepsOf(scene) - 1) {
    applyStep(stepIndex + 1);
  } else if (sceneIndex < scenes.length - 1) {
    mountScene(sceneIndex + 1, 0);
  }
}

function prev() {
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
      mountScene(0, 0);
      break;
    case "End":
      e.preventDefault();
      mountScene(scenes.length - 1, stepsOf(scenes[scenes.length - 1]) - 1);
      break;
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest("a,button,input,textarea")) return;
  const x = e.clientX / window.innerWidth;
  if (x > 0.5) next();
  else prev();
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

// Initial mount — honour hash if present (`#scene-id` or `#scene-id/step`)
const hash = location.hash.slice(1);
let initialId = hash;
let initialStep = 0;
if (hash.includes("/")) {
  const [id, st] = hash.split("/");
  initialId = id;
  initialStep = parseInt(st, 10) || 0;
}
const initialIndex = scenes.findIndex((s) => s.id === initialId);
mountScene(initialIndex >= 0 ? initialIndex : 0, initialStep);
