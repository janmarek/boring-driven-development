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

const claudeOctopus = `
  <svg class="claude-logo-svg" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M32 6c-9.4 0-17 7.2-17 16.1v9.5c0 .9-.4 1.7-1.1 2.3l-3.2 2.6c-.9.7-.5 2.1.6 2.3l3.5.6c.9.2 1.5.9 1.6 1.8.6 5.2 5 9.3 10.4 9.3 1.2 0 2.4-.2 3.4-.6.6-.2 1.2-.2 1.7 0 1.1.4 2.2.6 3.4.6 5.4 0 9.8-4.1 10.4-9.3.1-.9.7-1.6 1.6-1.8l3.5-.6c1.1-.2 1.5-1.6.6-2.3l-3.2-2.6c-.7-.6-1.1-1.4-1.1-2.3v-9.5C49 13.2 41.4 6 32 6z"/>
    <circle cx="25" cy="24" r="3" fill="#0a0a0a"/>
    <circle cx="39" cy="24" r="3" fill="#0a0a0a"/>
    <path d="M14 44c-2 1-4 4-6 4M22 50c-1 2-2 5-4 6M32 53c0 2 0 5-1 6M42 50c1 2 2 5 4 6M50 44c2 1 4 4 6 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>
`;

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
  // 1 — Title
  {
    id: "title",
    notes: "Title card. Set the tone.",
    render: () => `
      <div class="scene title-scene">
        <div class="title-eyebrow"><span class="dot"></span> A talk by Jan Marek</div>
        <h1 class="title-h1">
          Boring<br/>Driven<br/>
          <span class="accent">Development</span>
        </h1>
        <p class="title-tagline">
          Let your laziness and frustration<br/>
          guide your creativity in AI workflows.
        </p>
        <div class="title-dots">
          ${pacman("right", 84)}
          <div class="pellet"></div>
          <div class="pellet"></div>
          <div class="pellet"></div>
          <div class="pellet"></div>
        </div>
        <div class="title-footer">
          <div class="title-author">
            <span class="small">Speaker</span>
            Jan Marek
          </div>
          <div class="title-mews">
            <img src="MEWS_WORDMARK_WHITE.png" alt="Mews"/>
          </div>
        </div>
      </div>
    `,
  },

  // 2 — Abstract / hook
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
                ${claudeOctopus}
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

const stage = document.getElementById("stage");
const counterEl = document.getElementById("counter");
let index = 0;

function clamp(n) {
  return Math.max(0, Math.min(scenes.length - 1, n));
}

function renderScene(i) {
  index = clamp(i);
  const scene = scenes[index];
  let html = "";
  try {
    html = scene.render();
  } catch (err) {
    console.error("Scene render failed:", scene && scene.id, err);
    html = `<div class="scene"><div class="scene-fallback">Scene "${scene && scene.id}" failed to render — press → to continue.</div></div>`;
  }
  stage.innerHTML = html;
  counterEl.textContent = `${index + 1} / ${scenes.length} · ${scene.id}`;
  try {
    history.replaceState(null, "", `#${scene.id}`);
  } catch (_) {}
}

function next() { renderScene(index + 1); }
function prev() { renderScene(index - 1); }

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
      renderScene(0);
      break;
    case "End":
      e.preventDefault();
      renderScene(scenes.length - 1);
      break;
  }
});

// Click forward / right side, back / left side — works on touch too
document.addEventListener("click", (e) => {
  if (e.target.closest("a,button,input,textarea")) return;
  const x = e.clientX / window.innerWidth;
  if (x > 0.5) next();
  else prev();
});

// Responsive scaling
function fit() {
  const pad = 40;
  const sw = (window.innerWidth - pad) / STAGE_W;
  const sh = (window.innerHeight - pad) / STAGE_H;
  const s = Math.min(sw, sh);
  stage.style.transform = `scale(${s})`;
}
window.addEventListener("resize", fit);
fit();

// Initial render — honour hash if present
const initialId = location.hash.slice(1);
const initialIndex = scenes.findIndex((s) => s.id === initialId);
renderScene(initialIndex >= 0 ? initialIndex : 0);
