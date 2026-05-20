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
      "Terminal flow: MCP → create-issue → error about missing required fields → ask for a skill → skill saved. Bouncy scale-in entrance (it's the first window in the claude-arrival → claude-work 'row'), slide-left-fade exit. Background tints to offwhite on mount.",
    steps: 6,
    exitDuration: 700,
    background: "var(--offwhite)",
    xpBackground: true,
    render: () => `
      <div class="scene cw">
        ${appWindow({
          variant: "frame",
          theme: "terminal",
          title: "claude code",
          width: 1280,
          height: 760,
          className: "window-enter-scale window-exit-to-left",
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
      "VS Code editor showing the saved jira-grw skill: frontmatter (tools used, saved ids), When to use, required fields, description template. Slide-from-right entrance, slide-left-fade exit. Background stays offwhite (inherited from claude-work).",
    steps: 1,
    exitDuration: 700,
    background: "var(--offwhite)",
    xpBackground: true,
    render: () => `
      <div class="scene skill">
        ${appWindow({
          variant: "frame",
          theme: "editor",
          title: "jira-grw.md",
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
  // Followed by the ghost-rules pacman scene (black background, no
  // window), so this uses a fade-only exit (no destination window to
  // slide toward).
  {
    id: "github",
    notes:
      "GitHub Open-a-PR screen: title pre-filled, structured description, sidebar with reviewers / assignees / labels. Black background (no XP wallpaper) — reads as a single GitHub window floating on the void, and removes the cognitive load of the wallpaper while the audience reads the PR form. Fade-only exit straight into the also-black ghost-rules scene.",
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
                    <span class="gh-branch gh-branch-feature">split-bill-multi-card</span>
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
                  </aside>
                </div>
              </div>
            </div>
          `,
        })}
      </div>
    `,
  },

  // 7 — Ghost rules pacman beat. Black background. Pacman left, orange
  // ghost right. Ghost glides in close, speech bubble appears
  // ("You must create a ticket. Rules are rules."), then coffee
  // appears below pacman and pacman descends to eat it — frustration
  // → coping reflex, sets up the next claude scene.
  //
  //   0 — pacman left, orange ghost far right
  //   1 — ghost glides in closer
  //   2 — speech bubble appears
  //   3 — coffee emoji appears below pacman
  //   4 — pacman rotates down, descends, eats the coffee
  {
    id: "ghost-rules",
    notes:
      "Pacman vs orange ghost: 'You must create a ticket. Rules are rules.' Pacman reaches for coffee. Bridge between github (review bot nags) and claude-pr-flow (automate it all).",
    steps: 5,
    render: () => `
      <div class="scene ghost-rules">
        <div class="gr-pacman">${pacman("right", 110)}</div>
        <div class="gr-ghost">${ghost("var(--orange)", "", 110)}</div>
        <div class="gr-bubble">
          <div class="gr-bubble-text">You must create a ticket.<br/>Rules are rules.</div>
          <div class="gr-bubble-tail"></div>
        </div>
        <div class="gr-coffee">☕</div>
      </div>
    `,
  },

  // 8 — Claude PR flow scene. Reuses the claude code window. Picks up
  // from a prior turn that's already on screen ("pls fix bug" + ✓),
  // then user runs the bundled commit/jira/PR command, claude tracks
  // it with a task list that checks off green one-by-one. Github
  // review notifications pop in with stylistic nits. User asks to
  // fix what's reasonable and ignore the rest, then asks for a skill,
  // then asks to update CLAUDE.md so this stops being manual.
  //
  //   0 — pre-existing turn visible ("pls fix bug" → ✓ fixed)
  //   1 — user prompt: "commit, /jira-create, /create-pr"
  //   2 — claude prints a 4-item plan (all pending)
  //   3 — items check off one-by-one (staggered ◯ → ✓)
  //   4 — 4 desktop notifications pop in top-right (github icon,
  //       claude-bot stylistic nits)
  //   5 — user prompt: "read review comments and fix when reasonable"
  //   6 — claude summary: fixed 2, skipped 2 nits
  //   7 — user prompt: "btw create a skill for it"
  //   8 — ✓ Saved .claude/skills/pr-flow.md
  //   9 — user prompt: "pls update CLAUDE.md so I don't deal with
  //       this again"
  //   10 — ✓ Updated CLAUDE.md
  //
  // The transcript scrolls up at later steps so the latest content
  // stays in view as new turns arrive.
  {
    id: "claude-pr-flow",
    notes:
      "Claude PR flow with task list, review-comment notifications, skill creation, CLAUDE.md update. Slide-from-right entrance, slide-left exit (followed by another app/grid scene). Background offwhite + the vivid Windows-XP-coloured wallpaper (xp-bliss-bg-xp.svg) — the deck shifts to the louder XP variant from this scene onward.",
    steps: 11,
    exitDuration: 500,
    background: "var(--offwhite)",
    xpBackground: "icons/xp-bliss-bg-xp.svg",
    render: () => `
      <div class="scene pf">
        ${appWindow({
          variant: "frame",
          theme: "terminal",
          title: "claude code",
          width: 1280,
          height: 760,
          className: "window-enter-from-right window-exit-fade",
          body: `
            <div class="pf-screen">
              <div class="pf-splash">
                <img class="pf-mark" src="icons/pixel-octopus.svg" alt=""/>
                <span class="pf-brand">claude</span>
                <span class="pf-tip">tip: press <kbd>/</kbd> for commands</span>
              </div>
              <div class="pf-transcript">
                <div class="pf-scroll">
                  <!-- Pre-existing turn (visible at step 0) -->
                  <div class="pf-line pf-pre">
                    <span class="pf-arrow">›</span>
                    <span>pls fix the bug</span>
                  </div>
                  <div class="pf-line pf-pre"><span class="tool">Read</span><span class="pf-muted">src/checkout/TaxField.tsx</span></div>
                  <div class="pf-line pf-pre"><span class="tool">Edit</span><span class="pf-muted">re-render tax line on second submit</span></div>
                  <div class="pf-line pf-pre"><span class="pf-ok">✓</span> Fixed.</div>
                  <div class="pf-line pf-spacer pf-pre"></div>

                  <!-- Step 1: user prompt typewriter -->
                  <div class="pf-line pf-line-p1">
                    <span class="pf-arrow">›</span>
                    <span class="typewriter pf-tw-1"><span>commit, /jira-create, /create-pr</span></span>
                  </div>
                  <div class="pf-line pf-spacer pf-from-2"></div>

                  <!-- Step 2: claude plan header + 4 tasks (all pending) -->
                  <div class="pf-line pf-from-2 pf-muted">Plan (4 tasks):</div>
                  <div class="pf-line pf-from-2 pf-indent pf-task" data-task="0">
                    <span class="pf-task-icon"><span class="pf-box">◯</span><span class="pf-check">✓</span></span>
                    <span class="pf-task-text">commit changes</span>
                  </div>
                  <div class="pf-line pf-from-2 pf-indent pf-task" data-task="1">
                    <span class="pf-task-icon"><span class="pf-box">◯</span><span class="pf-check">✓</span></span>
                    <span class="pf-task-text">create jira issue</span>
                  </div>
                  <div class="pf-line pf-from-2 pf-indent pf-task" data-task="2">
                    <span class="pf-task-icon"><span class="pf-box">◯</span><span class="pf-check">✓</span></span>
                    <span class="pf-task-text">push branch</span>
                  </div>
                  <div class="pf-line pf-from-2 pf-indent pf-task" data-task="3">
                    <span class="pf-task-icon"><span class="pf-box">◯</span><span class="pf-check">✓</span></span>
                    <span class="pf-task-text">create PR via gh CLI</span>
                  </div>
                  <div class="pf-line pf-spacer pf-from-5"></div>

                  <!-- Step 5: user prompt -->
                  <div class="pf-line pf-line-p2">
                    <span class="pf-arrow">›</span>
                    <span class="typewriter pf-tw-2"><span>read review comments and fix when reasonable</span></span>
                  </div>

                  <!-- Step 6: claude summary -->
                  <div class="pf-line pf-from-6"><span class="tool">Read</span><span class="pf-muted">4 review comments on PR #1287</span></div>
                  <div class="pf-line pf-from-6 pf-indent"><span class="pf-ok">✓</span> Fixed 2 (missing semicolon, variable rename).</div>
                  <div class="pf-line pf-from-6 pf-indent"><span class="pf-skip">↷</span> <span class="pf-muted">Skipped 2 (forEach→map nit, ordering preference).</span></div>
                  <div class="pf-line pf-spacer pf-from-7"></div>

                  <!-- Step 7: user prompt -->
                  <div class="pf-line pf-line-p3">
                    <span class="pf-arrow">›</span>
                    <span class="typewriter pf-tw-3"><span>btw create a skill for it</span></span>
                  </div>
                  <!-- Step 8: skill saved -->
                  <div class="pf-line pf-from-8"><span class="pf-ok">✓</span> Saved <code>.claude/skills/pr-fix.md</code></div>
                  <div class="pf-line pf-spacer pf-from-9"></div>

                  <!-- Step 9: user prompt -->
                  <div class="pf-line pf-line-p4">
                    <span class="pf-arrow">›</span>
                    <span class="typewriter pf-tw-4"><span>pls update CLAUDE.md so I don't deal with this again</span></span>
                  </div>
                  <!-- Step 10: claude.md updated -->
                  <div class="pf-line pf-from-10"><span class="tool">Edit</span><span class="pf-muted">CLAUDE.md · added "Shipping a change" section</span></div>
                  <div class="pf-line pf-from-10 pf-indent"><span class="pf-ok">✓</span> Updated CLAUDE.md.</div>
                </div>
              </div>
            </div>
          `,
        })}

        <!-- Desktop notifications stack — appears top-right at step 4.
             Reviewers are clean-code legends so the nits read as
             dogmatic-but-named, not "robot bot review". -->
        <div class="pf-notif-stack">
          ${[
            ["unclebob", "consider renaming <code>data</code> to something descriptive", "1m"],
            ["kentbeck", "could this be <code>map</code> instead of <code>forEach</code>?", "1m"],
            ["mfowler", "nit: prefer <code>const</code> over <code>let</code> here", "2m"],
            ["unclebob", "minor: missing trailing newline", "2m"],
          ]
            .map(
              ([who, text, when]) => `
                <div class="pf-notif">
                  <div class="pf-notif-icon"><img src="icons/github-mark.svg" alt=""/></div>
                  <div class="pf-notif-body">
                    <div class="pf-notif-head"><span class="pf-notif-app">GitHub</span><span class="pf-notif-when">${when}</span></div>
                    <div class="pf-notif-title">${who} commented on PR #1287</div>
                    <div class="pf-notif-text">${text}</div>
                  </div>
                </div>`
            )
            .join("")}
        </div>
      </div>
    `,
  },

  // 9 — Boring grid. After the PR-fix skill is saved, Jan pulls back
  // to the broader picture: a developer's code doesn't ship straight to
  // prod — there are 8 named obstacles in the way. Pacman top-left
  // declares "Coding is boring." and the obstacle ghosts appear in a
  // 4×2 grid below, two rows revealed across two steps.
  //
  //   0 — pacman top-left + speech bubble "Coding is boring."
  //   1 — top row (4 obstacle ghosts) appears, staggered
  //   2 — bottom row (4 more) appears, staggered
  //
  // Obstacles drawn from mews-subscription-service/CLAUDE.md (coding
  // standards, layered architecture, unit + integration tests,
  // observability, documentation, code review, feature flags).
  {
    id: "boring-grid",
    notes:
      "Pacman appears alone → speech bubble fades in ('Coding is boring.') → 4×2 grid of obstacle ghosts (coding standards / architecture / unit tests / integration tests / observability / documentation / code review / feature flags) revealed across two more steps. Black background, no wallpaper — the void echoes the developer's mood.",
    steps: 4,
    render: () => `
      <div class="scene boring">
        <div class="bg-pacman">${pacman("right", 100)}</div>
        <div class="bg-bubble">
          <div class="bg-bubble-text">Coding is boring.</div>
          <div class="bg-bubble-tail"></div>
        </div>
        <div class="bg-grid">
          ${[
            ["#e34935",       "coding standards",  280, 500],
            ["var(--orange)", "architecture",      620, 500],
            ["#06b6d4",       "unit tests",        960, 500],
            ["var(--pink)",   "integration tests", 1300, 500],
            ["#16a34a",       "observability",     280, 760],
            ["#a855f7",       "documentation",     620, 760],
            ["#fbbf24",       "code review",       960, 760],
            ["#6366f1",       "feature flags",     1300, 760],
          ]
            .map(([color, label, x, y], i) => `
              <div class="bg-cell" data-cell="${i}" style="left:${x}px; top:${y}px;">
                ${ghost(color, label, 90)}
              </div>`)
            .join("")}
        </div>
      </div>
    `,
  },

  // 10 — Claude.md scene. After enumerating the obstacles, the payoff:
  // CLAUDE.md already has a section for each one. Reuses the .skill
  // scene's editor styling (same VS Code-ish chrome) — added as a
  // second class on the root so all `.skill .sk-*` rules apply
  // unchanged while the scene id stays distinct for the HUD.
  {
    id: "claude-md",
    notes:
      "VS Code editor showing CLAUDE.md — every obstacle from the previous grid has its own documented section. Reuses .skill scope via the extra `skill` class on the root. Step 1 fires 4 slack-style incident notifications top-right (white cards, Coralogix / PagerDuty / Sentry / incident.io bots) — the setup for the next claude-incident scene. Slide-from-right entrance, slide-left exit (next scene is another app window). Sunset wallpaper.",
    steps: 2,
    exitDuration: 700,
    background: "var(--offwhite)",
    xpBackground: "icons/xp-bliss-bg-sunset.svg",
    render: () => `
      <div class="scene claude-md skill">
        ${appWindow({
          variant: "frame",
          theme: "editor",
          title: "CLAUDE.md",
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
                  <div class="sk-tree-file sk-indent-2">jira-grw.md</div>
                  <div class="sk-tree-file sk-indent-2">pr-fix.md</div>
                  <div class="sk-tree-folder">▸ src</div>
                  <div class="sk-tree-folder">▸ tests</div>
                  <div class="sk-tree-file sk-active">CLAUDE.md</div>
                  <div class="sk-tree-file">README.md</div>
                  <div class="sk-tree-file">package.json</div>
                </div>
              </div>
              <div class="sk-tabs">
                <div class="sk-tab sk-active">CLAUDE.md <span class="sk-x">×</span></div>
              </div>
              <div class="sk-code">
                <div class="sk-gutter">
                  ${Array.from({ length: 36 }, (_, i) => `<div>${i + 1}</div>`).join("")}
                </div>
                <div class="sk-content">
                  <div class="sk-line"><span class="sk-h1"># CLAUDE.md</span></div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Coding standards</span></div>
                  <div class="sk-line">- <span class="sk-em">CSharpier</span> formats all C# code via pre-commit hook</div>
                  <div class="sk-line">- <span class="sk-em">Roslynator</span> analyzers active; warnings are errors</div>
                  <div class="sk-line">- <span class="sk-em">Named parameters</span> required for 2+ arguments</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Architecture</span></div>
                  <div class="sk-line">- Domain → Application → Infrastructure → Presentation</div>
                  <div class="sk-line">- Modules named by feature, not service (<span class="sk-str">BillingDocuments.Domain</span>)</div>
                  <div class="sk-line">- One adapter per port; ports owned by Application</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Testing</span></div>
                  <div class="sk-line">- <span class="sk-em">Unit tests</span> own branch coverage (NUnit + NSubstitute)</div>
                  <div class="sk-line">- <span class="sk-em">Integration tests</span> via <span class="sk-str">WebApplicationFactory&lt;Program&gt;</span></div>
                  <div class="sk-line">- <span class="sk-em">DTO contract tests</span> against Nue sandbox responses</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Observability</span></div>
                  <div class="sk-line">- OpenTelemetry → Coralogix + New Relic</div>
                  <div class="sk-line">- Custom meters live in <span class="sk-str">Instrumentation.cs</span></div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Documentation</span></div>
                  <div class="sk-line">- Be concise — document <em>what</em> + <em>how</em>, skip <em>why</em></div>
                  <div class="sk-line">- Update CLAUDE.md when a new pattern emerges</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Code review</span></div>
                  <div class="sk-line">- Run <span class="sk-str">/pr-fix</span> on review comments — fix what's reasonable</div>
                  <div class="sk-line">- Skip stylistic nits; argue with reviewers, not the linter</div>
                  <div class="sk-line"></div>
                  <div class="sk-line"><span class="sk-h2">## Feature flags</span></div>
                  <div class="sk-line">- <span class="sk-em">LaunchDarkly</span> for release flags + kill switches</div>
                  <div class="sk-line">- Wrap new code paths until the metric is clean</div>
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

        <!-- Slack-style incident notifications stack — appears top-right
             at step 1. Sets up the next claude-incident scene by piling
             on automated alerts the moment we finish reading the doc. -->
        <div class="cm-notif-stack">
          ${[
            ["Coralogix bot", "#alerts",   "P2: <code>/checkout</code> error rate &gt; 1% (last 5m)", "1m"],
            ["PagerDuty bot", "#oncall",   "page Jan — <code>mews-pms</code> p99 latency &gt; 2s", "1m"],
            ["Sentry bot",    "#mews-pms", "NullReferenceException · <code>TaxField.cs:42</code>", "2m"],
            ["incident.io bot", "#status", "Incident MEWS-2025-04 declared (P2)", "2m"],
          ]
            .map(([who, channel, msg, when]) => `
              <div class="slack-notif">
                <div class="slack-notif-icon"><img src="icons/slack-mark.svg" alt=""/></div>
                <div class="slack-notif-body">
                  <div class="slack-notif-head"><span class="slack-notif-app">Slack</span><span class="slack-notif-when">${when}</span></div>
                  <div class="slack-notif-title">${who} in ${channel}</div>
                  <div class="slack-notif-text">${msg}</div>
                </div>
              </div>`)
            .join("")}
        </div>
      </div>
    `,
  },

  // 11 — Claude incident response. Picks up from claude-md (where the
  // alerts piled on): user asks claude to investigate via the atlas
  // coralogix skill, claude diagnoses + fixes, then announces on Slack
  // through a slack-announce skill with a deliberate review step
  // before posting. Four colleague thank-you notifications pop in at
  // the end (international names, both genders).
  //
  //   0 — empty terminal (window just flew in)
  //   1 — user prompt typewriter: investigate /checkout incident
  //   2 — claude calls coralogix skill, queries + traces + diff
  //   3 — diagnosis + fix applied
  //   4 — user prompt typewriter: announce on #status
  //   5 — claude drafts the slack message (review step — speaker pauses)
  //   6 — ✓ posted to #status
  //   7 — 4 colleague thank-you slack notifications pop in (top-right)
  {
    id: "claude-incident",
    notes:
      "Coralogix skill → diagnosis → fix → slack-announce skill with review step → ✓ posted → colleague thank-yous pop in. Slide-from-right entrance, fade-only exit (last app window before the closing slide). Blue-hour wallpaper — the deck's twilight beat as the engineer wraps up.",
    steps: 8,
    exitDuration: 500,
    background: "var(--offwhite)",
    xpBackground: "icons/xp-bliss-bg-blue-hour.svg",
    render: () => `
      <div class="scene ci">
        ${appWindow({
          variant: "frame",
          theme: "terminal",
          title: "claude code",
          width: 1280,
          height: 760,
          className: "window-enter-from-right window-exit-fade",
          body: `
            <div class="ci-screen">
              <div class="ci-splash">
                <img class="ci-mark" src="icons/pixel-octopus.svg" alt=""/>
                <span class="ci-brand">claude</span>
                <span class="ci-tip">tip: press <kbd>/</kbd> for commands</span>
              </div>
              <div class="ci-transcript">
                <div class="ci-scroll">
                  <!-- Step 1: investigate prompt -->
                  <div class="ci-line ci-line-p1">
                    <span class="ci-arrow">›</span>
                    <span class="typewriter ci-tw-1"><span>investigate /checkout 500 spike — what changed, p99 last 30m</span></span>
                  </div>
                  <div class="ci-line ci-spacer ci-from-2"></div>

                  <!-- Step 2: claude calls coralogix skill, runs queries -->
                  <div class="ci-line ci-from-2">Skill: <code>atlas:coralogix</code></div>
                  <div class="ci-line ci-from-2 ci-indent"><span class="tool">Query</span><span class="ci-muted">Dataprime · service=mews-pms /checkout → 1,247 errors past 30m (baseline ~0)</span></div>
                  <div class="ci-line ci-from-2 ci-indent"><span class="tool">Trace</span><span class="ci-muted">get_traces_v1 · NPE pattern across 89% of failed traces</span></div>
                  <div class="ci-line ci-from-2 ci-indent"><span class="tool">Diff</span><span class="ci-muted">src/checkout/TaxField.cs · last touched by PR #1287 at 14:30</span></div>
                  <div class="ci-line ci-spacer ci-from-3"></div>

                  <!-- Step 3: diagnosis + fix -->
                  <div class="ci-line ci-from-3"><span class="ci-err">✗</span> Root cause: <code>TaxField.cs:42</code> dereferences <code>taxConfig</code> without a null guard.</div>
                  <div class="ci-line ci-from-3 ci-indent ci-muted">p99 latency: 4.8s (baseline 280ms)</div>
                  <div class="ci-line ci-from-3"><span class="tool">Edit</span><span class="ci-muted">src/checkout/TaxField.cs · added null guard for taxConfig</span></div>
                  <div class="ci-line ci-from-3 ci-indent"><span class="ci-ok">✓</span> Fixed. Hotfix queued — ETA 5m.</div>
                  <div class="ci-line ci-spacer ci-from-4"></div>

                  <!-- Step 4: announce prompt -->
                  <div class="ci-line ci-line-p2">
                    <span class="ci-arrow">›</span>
                    <span class="typewriter ci-tw-2"><span>announce on #status that it's resolved</span></span>
                  </div>
                  <div class="ci-line ci-spacer ci-from-5"></div>

                  <!-- Step 5: claude drafts message + review prompt -->
                  <div class="ci-line ci-from-5">Skill: <code>slack-announce</code></div>
                  <div class="ci-line ci-from-5">Draft for <code>#status</code>:</div>
                  <div class="ci-draft ci-from-5">
                    <div>🟢 RESOLVED · /checkout 500 spike (14:32 → 14:47)</div>
                    <div>Root cause: NPE in TaxField.cs (PR #1287 regression)</div>
                    <div>Hotfix: a3b9d2c · rolled out 14:46 · no customer impact</div>
                  </div>
                  <div class="ci-line ci-from-5 ci-indent ci-muted">[Review draft — press → to send]</div>
                  <div class="ci-line ci-spacer ci-from-6"></div>

                  <!-- Step 6: posted -->
                  <div class="ci-line ci-from-6"><span class="ci-ok">✓</span> Posted to <code>#status</code>.</div>
                </div>
              </div>
            </div>
          `,
        })}

        <!-- Step 7: colleague thank-you slack notifications pop in. -->
        <div class="ci-notif-stack">
          ${[
            ["Marie Dubois", "#status", "merci! you saved us 🙏", "now"],
            ["Tomás García", "#status", "gracias amigo 🚀 super fast", "now"],
            ["Yuki Tanaka", "#status", "amazing fix 🔥 thank you", "1m"],
            ["Karl Müller", "#status", "🎉 danke schön!", "1m"],
          ]
            .map(([who, channel, msg, when]) => `
              <div class="slack-notif">
                <div class="slack-notif-icon"><img src="icons/slack-mark.svg" alt=""/></div>
                <div class="slack-notif-body">
                  <div class="slack-notif-head"><span class="slack-notif-app">Slack</span><span class="slack-notif-when">${when}</span></div>
                  <div class="slack-notif-title">${who} in ${channel}</div>
                  <div class="slack-notif-text">${msg}</div>
                </div>
              </div>`)
            .join("")}
        </div>
      </div>
    `,
  },

  // 12 — Takeaways. Traditional summary slide. Black background, no
  // wallpaper. Pacman starts at the top, descends through 3 rewards
  // (🍰 🍩 🍫); each reward eaten reveals one takeaway to its right.
  //
  //   0 — pacman top, 3 rewards visible, no takeaways yet
  //   1 — pacman descends to reward 1, eats; takeaway 1 fades in
  //   2 — pacman descends to reward 2, eats; takeaway 2 fades in
  //   3 — pacman descends to reward 3, eats; takeaway 3 fades in
  {
    id: "takeaways",
    notes:
      "Summary slide. Pacman descends through 3 rewards — each bite reveals one takeaway. Black bg, no wallpaper. Lessons match the talk's arc: observe and automate friction; automate what'll happen again; chain small skills into magic.",
    steps: 4,
    render: () => `
      <div class="scene takeaways">
        <h2 class="tk-title">What to take away</h2>

        <div class="tk-pacman">${pacman("down", 96)}</div>

        ${[
          ["🍰", "Observe. Automate what you don't like."],
          ["🍩", "Automate what you just did and will happen again."],
          ["🍫", "Chain small skills and automations — create magic."],
        ]
          .map(([reward, text], i) => `
            <div class="tk-row" data-row="${i}">
              <div class="tk-reward">${reward}</div>
              <div class="tk-takeaway">${text}</div>
            </div>`)
          .join("")}
      </div>
    `,
  },

  // 13 — Abstract / hook (legacy slide kept for reuse)
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
