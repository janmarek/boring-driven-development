// Boring Driven Development — scene content.
// Each scene is independent. The framework (helpers + navigation) lives
// in runtime.js. Helpers referenced here (pacman, ghost, appWindow) are
// defined there; they're only called when render() runs, so the load
// order (scenes.js → runtime.js) is fine.
//
// See CLAUDE.md for the scene shape and the merged-scene authoring
// pattern.

const scenes = [
  // 1 — Intro (merged title → slack flow, 7 steps)
  // Pacman + dots are the same DOM elements throughout, so the transition
  // from title to slack flow animates smoothly.
  {
    id: "title",
    notes:
      "Title → slack flow in one scene. 10 beats: title → fade+center → slack appears → eat dots → notify → eat notif → window → bug → composer+typing → delete. Advancing past step 9 fires the slack window's slide-left-fade exit (window-exit-to-left) while jira flies in from the right.",
    steps: 10,
    exitDuration: 700,
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

        <!-- Schematic Slack window — first app window in the deck, so it
             uses the bouncy scale-in (window-enter-scale). Slide-left-fade
             exit (window-exit-to-left) when title advances to jira. -->
        <div class="intro-window window-enter-scale window-exit-to-left">
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

  // 2 — Jira flow (schematic). 4 beats:
  //   0 — backlog flies in from the right
  //   1 — "+ Create" → create-issue modal scales in
  //   2 — summary typewriter fills
  //   3 — tedious required fields fill in staggered (type, team, story
  //       points, labels, structured description) → "look at all this"
  // Advancing past step 3 plays a disappear animation (window scales
  // down + fades out) via the runtime's exitDuration mechanism — no
  // dedicated "empty" exit step.
  {
    id: "jira",
    notes:
      "Schematic Jira: backlog → create modal → struggle filling fields. Two-phase disappear on advance: modal closes first (0.3s), pause, then the window slides left (0.6s, delayed 0.5s) — total exitDuration 1100ms.",
    steps: 4,
    exitDuration: 1100,
    render: () => `
      <div class="scene jira">
        <div class="jira-window window-enter-from-right window-exit-to-left">
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

  // 3 — Claude arrival (3 steps).
  //   0 — pacman appears center-top facing right (no rotation yet)
  //   1 — pacman rotates 90° to face down; Claude AI icon (with CLAUDE
  //       label) scales in low in the stage; 3 dots appear between
  //       pacman and the icon
  //   2 — pacman descends along the dot trail, eating each dot in
  //       sequence, then eats the icon
  // The claude code window used to scale in here as a splash with
  // "tip: press / for commands" — no useful content. Dropped; the
  // window's cool scale-in entrance now lives in claude-work step 0
  // with the actual terminal content inside.
  {
    id: "claude-arrival",
    notes:
      "Pacman descends along a 3-dot trail, eats the Claude AI icon. No window — claude-work's window does the entrance with real content.",
    steps: 3,
    render: () => `
      <div class="scene claude-arrival">
        <div class="ca-pacman">${pacman("right", 84)}</div>
        <!-- 3 dots stacked vertically between pacman start (top 100) and
             icon (top 620) — eaten in stagger at step 2 as pacman descends. -->
        <div class="ca-dots">
          <div class="ca-dot"></div>
          <div class="ca-dot"></div>
          <div class="ca-dot"></div>
        </div>
        <div class="ca-icon">
          <img src="icons/claude-ai-icon.svg" alt=""/>
          <div class="ca-icon-label">claude</div>
        </div>
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
      "Terminal flow: MCP → create-issue → error about missing required fields → ask for a skill → skill saved. Slide-from-right entrance, slide-left-fade exit (shared framework classes).",
    steps: 6,
    exitDuration: 700,
    render: () => `
      <div class="scene cw">
        ${appWindow({
          variant: "frame",
          theme: "terminal",
          title: "claude code",
          width: 1280,
          height: 760,
          className: "window-enter-from-right window-exit-to-left",
          body: `
            <div class="cw-screen">
              <div class="cw-splash">
                <img class="cw-mark" src="icons/pixel-octopus.svg" alt=""/>
                <span class="cw-brand">claude</span>
                <span class="cw-tip">tip: press <kbd>/</kbd> for commands</span>
              </div>
              <div class="cw-transcript">
                <div class="cw-line cw-line-mcp0a">› /mcp slack connect</div>
                <div class="cw-line cw-line-mcp0b"><span class="cw-ok">✓</span> Connected to slack-mcp — 4 tools available</div>
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
      "VS Code editor showing the saved jira-grw skill: frontmatter (tools used, saved ids), When to use, required fields, description template. Slide-from-right entrance, slide-left-fade exit.",
    steps: 1,
    exitDuration: 700,
    render: () => `
      <div class="scene skill">
        ${appWindow({
          variant: "frame",
          theme: "editor",
          title: "jira-grw.md — claude code",
          width: 1300,
          height: 780,
          className: "window-enter-from-right window-exit-to-left",
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

  // 6 — GitHub "Open a pull request" screen — the ship-it beat.
  // Last app window before the closing slide, so it uses the shared
  // window-enter-from-right entrance but a fade-only exit (no slide).
  {
    id: "github",
    notes:
      "GitHub Open-a-PR screen: title pre-filled, structured description, claude-bot in reviewers. Last app window — fade-only exit.",
    exitDuration: 500,
    render: () => `
      <div class="scene gh-scene">
        ${appWindow({
          variant: "frame",
          theme: "github",
          title: "github.com — mews/mews-pms",
          width: 1380,
          height: 800,
          className: "window-enter-from-right window-exit-fade",
          body: `
            <div class="gh">
              <div class="gh-topbar">
                <div class="gh-mark"></div>
                <div class="gh-search">Type <kbd>/</kbd> to search</div>
                <div class="gh-nav">
                  <span>Pull requests</span>
                  <span>Issues</span>
                  <span>Marketplace</span>
                  <span>Explore</span>
                </div>
              </div>
              <div class="gh-repo-bar">
                <div class="gh-repo-name">mews <span class="gh-slash">/</span> <strong>mews-pms</strong></div>
                <div class="gh-tabs">
                  <span class="gh-tab">Code</span>
                  <span class="gh-tab">Issues</span>
                  <span class="gh-tab gh-tab-active">Pull requests <span class="gh-tab-badge">12</span></span>
                  <span class="gh-tab">Actions</span>
                  <span class="gh-tab">Projects</span>
                </div>
              </div>
              <div class="gh-page">
                <div class="gh-page-head">
                  <h2>Open a pull request</h2>
                  <div class="gh-compare">
                    <span class="gh-compare-label">base:</span>
                    <span class="gh-branch">main</span>
                    <span class="gh-arrow">←</span>
                    <span class="gh-compare-label">compare:</span>
                    <span class="gh-branch gh-branch-feature">grw-1405-split-bill</span>
                  </div>
                </div>
                <div class="gh-body">
                  <div class="gh-main">
                    <div class="gh-field">
                      <label>Title</label>
                      <div class="gh-input">feat(payments): split bill across multiple cards</div>
                    </div>
                    <div class="gh-field">
                      <label>Description</label>
                      <div class="gh-textarea">
                        <div class="gh-md-h">## Summary</div>
                        <div class="gh-md-line">- Add <code>SplitPaymentBuilder</code> with per-card allocations</div>
                        <div class="gh-md-line">- Update checkout flow to accept multiple cards</div>
                        <div class="gh-md-line">- Closes <a class="gh-md-link">GRW-1405</a></div>
                        <div class="gh-md-h">## Test plan</div>
                        <div class="gh-md-line">- [x] Unit tests for builder validation</div>
                        <div class="gh-md-line">- [x] Manual test in staging with 2-card split</div>
                      </div>
                    </div>
                    <div class="gh-actions">
                      <button class="gh-btn">Cancel</button>
                      <button class="gh-btn gh-btn-primary">Create pull request</button>
                    </div>
                  </div>
                  <aside class="gh-sidebar">
                    <div class="gh-side-section">
                      <div class="gh-side-label">Reviewers</div>
                      <div class="gh-side-value"><span class="gh-pill">@payments-team</span></div>
                    </div>
                    <div class="gh-side-section">
                      <div class="gh-side-label">Assignees</div>
                      <div class="gh-side-value"><span class="gh-avatar">JM</span> jan-marek</div>
                    </div>
                    <div class="gh-side-section">
                      <div class="gh-side-label">Labels</div>
                      <div class="gh-side-value">
                        <span class="gh-label gh-label-payments">payments</span>
                        <span class="gh-label gh-label-tax">tax</span>
                      </div>
                    </div>
                    <div class="gh-side-section">
                      <div class="gh-side-label">Linked issue</div>
                      <div class="gh-side-value gh-side-link">GRW-1405</div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          `,
        })}
      </div>
    `,
  },

  // 7 — Abstract / hook (legacy slide kept for reuse)
  {
    id: "abstract",
    notes:
      "The core idea. Inspiration vs frustration — pink ghost above, two-line heading, pacman + ghosts in the bottom-right corner.",
    render: () => `
      <div class="scene abstract-scene">
        <div class="abstract-ghost">${ghost("var(--pink)", "")}</div>
        <h2 class="abstract-h2">
          Creativity in engineering doesn't always start with <span class="pink">inspiration.</span><br/>
          Sometimes it starts with <em>frustration.</em>
        </h2>
        <div style="position:absolute; right:120px; bottom:120px;">
          ${pacman("right", 90)}
        </div>
      </div>
    `,
  },
];
