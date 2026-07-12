import {
  loadState,
  addContact,
  updateContact,
  deleteContact,
  addPendingCard,
  classifyPendingCard,
  setActiveMission,
  completeMission,
  logDailyActivity,
  getTodayLog,
  getTodayXpTotal,
  addXp,
  addChatMessage,
  clearChatHistory,
  setLastRadarResult,
  ARCHETYPES,
  RELATIONSHIP_TAGS,
} from './store.js';

import {
  formatDate,
  formatDaysAgo,
  getRelationshipCounts,
  generateOpportunityRadar,
  generateConversationMission,
  getSuggestedNextAction,
  getConnectionScore,
  getCoachResponse,
  getInitials,
  renderMarkdownLite,
} from './logic.js';

let state = loadState();
let currentView = 'dashboard';
let draggedCardId = null;

const VIEW_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Your connection command center' },
  radar: { title: 'Opportunity Radar', subtitle: 'Real-world targeting system' },
  mission: { title: 'Conversation Mission', subtitle: 'Prepare before you approach' },
  sifting: { title: 'Sifting Board', subtitle: 'Classify people after conversation' },
  crm: { title: 'Relationship CRM', subtitle: 'Your relationship database' },
  coach: { title: 'Zoom-Fu AI', subtitle: 'Your connection coach' },
  score: { title: 'Human Connection Score', subtitle: 'Measure and improve daily' },
};

const COACH_PROMPTS = [
  'What should I say?',
  'What questions should I ask?',
  'How do I deepen rapport?',
  'How do I follow up?',
];

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function showToast(message, type = 'success') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function openModal(title, html) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = html;
  $('#modal').hidden = false;
}

function closeModal() {
  $('#modal').hidden = true;
}

function navigate(view) {
  currentView = view;
  $$('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  const meta = VIEW_META[view];
  $('#view-title').textContent = meta.title;
  $('#view-subtitle').textContent = meta.subtitle;
  updateTopbarXp();
  render();
  closeSidebar();
}

function closeSidebar() {
  $('#sidebar').classList.remove('open');
  $('#overlay').classList.remove('visible');
}

function updateTopbarXp() {
  const xp = getTodayXpTotal(state);
  $('#topbar-xp').textContent = xp > 0 ? `+${xp} XP today` : '0 XP today';
}

function updateSiftingBadge() {
  const count = state.pendingCards.length;
  const badge = $('#sifting-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function tagBadgeHtml(tag) {
  const labels = {
    mentor: 'Mentor', friend: 'Friend', client: 'Client',
    romantic: 'Romantic', collaborator: 'Collaborator',
  };
  return `<span class="tag-badge tag-${tag}">${labels[tag] || tag}</span>`;
}

/* ─── Dashboard ─── */
function renderDashboard() {
  const counts = getRelationshipCounts(state.contacts);
  const todayXp = getTodayXpTotal(state);
  const score = getConnectionScore(state.dailyLogs, state.contacts);

  return `
    <div class="grid grid-2 mb-1">
      <div class="card">
        <div class="section-title">Current Stats</div>
        <div class="stat-row">
          ${ARCHETYPES.map((a) => `
            <div class="stat-pill">
              <span class="icon">${a.icon}</span>
              <span class="label">${a.label}</span>
              <span class="value">${state.archetypeStats[a.key] || 0}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card xp-banner">
        <div class="card-label">Today's XP</div>
        <div class="xp-value">+${todayXp}</div>
        <p class="card-hint">Earn XP through missions, conversations, and follow-ups</p>
      </div>
    </div>

    <div class="card mb-1">
      <div class="section-title">Relationship Assets</div>
      <div class="stat-row">
        <div class="stat-pill">
          <span class="icon">🏛</span>
          <span class="label">Mentors</span>
          <span class="value">${counts.mentor}</span>
        </div>
        <div class="stat-pill">
          <span class="icon">🤝</span>
          <span class="label">Friends</span>
          <span class="value">${counts.friend}</span>
        </div>
        <div class="stat-pill">
          <span class="icon">💼</span>
          <span class="label">Clients</span>
          <span class="value">${counts.client}</span>
        </div>
        <div class="stat-pill">
          <span class="icon">❤️</span>
          <span class="label">Romantic</span>
          <span class="value">${counts.romantic}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="section-title">Quick Actions</div>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" data-nav="radar">Scan opportunities</button>
          <button class="btn btn-secondary btn-sm" data-nav="mission">Start a mission</button>
          <button class="btn btn-secondary btn-sm" data-nav="coach">Ask the coach</button>
        </div>
        ${state.activeMission ? `
          <div class="contact-action mt-1">
            Active mission: <strong>${state.activeMission.contactName}</strong>
            <button class="btn btn-primary btn-sm mt-1" data-nav="mission">Continue →</button>
          </div>
        ` : ''}
      </div>
      <div class="card">
        <div class="section-title">Connection Score</div>
        <div class="flex-between mb-1">
          <span style="font-size:2rem;font-weight:700;font-family:var(--mono);color:var(--accent)">${score.total}/100</span>
          <button class="btn btn-secondary btn-sm" data-nav="score">View detail →</button>
        </div>
        <div class="progress-bar"><div class="progress-fill accent" style="width:${score.total}%"></div></div>
        <p class="card-hint mt-1">${score.recommendedMission}</p>
      </div>
    </div>

    ${state.contacts.length > 0 ? `
      <div class="mt-2">
        <div class="section-title">Recent Contacts <span>needs attention</span></div>
        <div class="grid grid-2">
          ${[...state.contacts]
            .sort((a, b) => (a.lastInteraction || '').localeCompare(b.lastInteraction || ''))
            .slice(0, 4)
            .map((c) => `
              <div class="card contact-card">
                <div class="contact-avatar">${getInitials(c.name)}</div>
                <div class="contact-info">
                  <h3>${c.name}</h3>
                  ${(c.tags || []).map(tagBadgeHtml).join('')}
                  <div class="contact-meta">Last seen: ${formatDaysAgo(c.lastInteraction)}</div>
                  <div class="contact-action">${getSuggestedNextAction(c)}</div>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

/* ─── Opportunity Radar ─── */
function renderRadar() {
  const result = state.lastRadarResult;

  return `
    <div class="card radar-input-card mb-1">
      <div class="section-title">Where are you right now?</div>
      <form id="radar-form" class="form-grid">
        <div class="field">
          <label for="radar-context">Describe your situation</label>
          <input type="text" id="radar-context" name="context"
            placeholder="I am at a Toastmasters meeting."
            value="${result?.context || ''}">
        </div>
        <button type="submit" class="btn btn-primary">Scan for opportunities</button>
      </form>
    </div>

    ${result ? `
      <div class="card">
        <div class="section-title">Targeting for: <span>"${result.context}"</span></div>
        ${result.categories.map((cat) => `
          <div class="radar-category">
            <h4>${cat.icon} ${cat.label}</h4>
            <div class="card-label">Talk to:</div>
            <div class="radar-people">
              ${cat.people.map((p) => `
                <button type="button" class="person-chip" data-radar-person="${p.name}" data-radar-context="${result.context}">
                  <span class="add-icon">+</span> ${p.name}
                </button>
              `).join('')}
            </div>
            <div class="radar-reason">Reason: "${cat.reason}"</div>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="card empty-state">
        <div class="icon">◎</div>
        <h3>Enter your context</h3>
        <p>Tell Zoom-Fu where you are and who might be worth talking to.</p>
      </div>
    `}
  `;
}

/* ─── Conversation Mission ─── */
function renderMission() {
  const mission = state.activeMission;

  if (!mission) {
    return `
      <div class="card mb-1">
        <div class="section-title">Start a new mission</div>
        <form id="mission-form" class="form-grid">
          <div class="field">
            <label for="mission-name">Who are you approaching?</label>
            <input type="text" id="mission-name" name="name" placeholder="Sarah" required>
          </div>
          <div class="field">
            <label for="mission-context">Context (optional)</label>
            <input type="text" id="mission-context" name="context" placeholder="Toastmasters meeting">
          </div>
          <button type="submit" class="btn btn-primary">Generate mission</button>
        </form>
      </div>
      <div class="card empty-state">
        <div class="icon">🎯</div>
        <h3>No active mission</h3>
        <p>Enter a name above or pick someone from Opportunity Radar.</p>
      </div>
    `;
  }

  const allDone = mission.objectives.every((o) => o.done);

  return `
    <div class="card mission-card">
      <div class="card-label">Mission</div>
      <div class="mission-target">${mission.contactName}</div>
      ${mission.context ? `<p class="card-hint">at ${mission.context}</p>` : ''}

      <div class="section-title" style="justify-content:center">Learn:</div>
      <div class="objective-list">
        ${mission.objectives.map((obj, i) => `
          <div class="objective-item ${obj.done ? 'done' : ''}" data-objective-idx="${i}">
            <span class="check">${obj.done ? '✓' : ''}</span>
            <span>${obj.label}</span>
          </div>
        `).join('')}
      </div>

      <div class="reward-badge">Reward: +${mission.xpReward} XP</div>

      <div class="opener-box">
        <p><strong>Suggested openers:</strong></p>
        ${mission.openers.map((o) => `<blockquote>${o}</blockquote>`).join('')}
      </div>

      <div class="btn-group mt-2" style="justify-content:center">
        ${allDone
          ? `<button class="btn btn-primary" id="complete-mission">Complete mission (+${mission.xpReward} XP)</button>`
          : `<button class="btn btn-secondary" id="cancel-mission">Cancel mission</button>`
        }
        <button class="btn btn-secondary btn-sm" data-nav="sifting">Go to Sifting Board →</button>
      </div>
    </div>
  `;
}

/* ─── Sifting Board ─── */
function renderSifting() {
  const pending = state.pendingCards;
  const zones = RELATIONSHIP_TAGS.filter((t) => t.key !== 'not-a-fit');
  zones.push({ key: 'not-a-fit', label: 'Not a Fit', icon: '✕' });

  if (pending.length === 0 && state.contacts.length === 0) {
    return `
      <div class="card empty-state">
        <div class="icon">⊞</div>
        <h3>No cards to sift</h3>
        <p>After a conversation, add people here to classify them into your relationship database.</p>
        <button class="btn btn-primary mt-1" id="add-sift-card">Add a person</button>
      </div>
    `;
  }

  return `
    <div class="flex-between mb-1">
      <p class="card-hint">Drag each card into a category. Notes are saved to your CRM.</p>
      <button class="btn btn-secondary btn-sm" id="add-sift-card">+ Add person</button>
    </div>
    <div class="sifting-board">
      <div class="sifting-queue">
        <div class="section-title">Queue <span>${pending.length} pending</span></div>
        ${pending.length === 0
          ? '<p class="card-hint">Queue empty — add someone after your next conversation.</p>'
          : pending.map((card) => `
              <div class="sift-card" draggable="true" data-card-id="${card.id}">
                <div class="name">${card.name}</div>
                <div class="meta">${card.context || 'No context'}</div>
              </div>
            `).join('')
        }
      </div>
      <div>
        <div class="section-title">Drop zones</div>
        <div class="sifting-zones">
          ${zones.map((z) => `
            <div class="drop-zone ${z.key}" data-drop-tag="${z.key}">
              <div class="zone-label">${z.icon} ${z.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ─── Relationship CRM ─── */
function renderCrm() {
  if (state.contacts.length === 0) {
    return `
      <div class="card empty-state">
        <div class="icon">☰</div>
        <h3>No contacts yet</h3>
        <p>Classify people on the Sifting Board or add them from Opportunity Radar.</p>
        <button class="btn btn-primary mt-1" data-nav="radar">Scan opportunities</button>
      </div>
    `;
  }

  const sorted = [...state.contacts].sort((a, b) => a.name.localeCompare(b.name));

  return `
    <div class="flex-between mb-1">
      <span class="card-hint">${sorted.length} people in your database</span>
      <button class="btn btn-secondary btn-sm" id="add-contact-btn">+ Add contact</button>
    </div>
    <div class="grid grid-2">
      ${sorted.map((c) => `
        <div class="card contact-card" data-contact-id="${c.id}">
          <div class="contact-avatar">
            ${c.photo ? `<img src="${c.photo}" alt="${c.name}">` : getInitials(c.name)}
          </div>
          <div class="contact-info">
            <h3>${c.name}</h3>
            ${(c.tags || []).map(tagBadgeHtml).join('')}
            ${c.profession ? `<div class="contact-meta">${c.profession}</div>` : ''}
            <div class="contact-meta">Last seen: ${formatDaysAgo(c.lastInteraction)}</div>
            <div class="contact-action">
              <strong>Suggested next action:</strong><br>
              "${getSuggestedNextAction(c)}"
            </div>
            ${c.notes ? `<div class="contact-meta mt-1">${c.notes}</div>` : ''}
            <div class="btn-group mt-1">
              <button class="btn btn-secondary btn-sm" data-edit-contact="${c.id}">Edit</button>
              <button class="btn btn-secondary btn-sm" data-mission-contact="${c.name}">New mission</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ─── Zoom-Fu AI Coach ─── */
function renderCoach() {
  const messages = state.chatHistory;

  return `
    <div class="coach-layout">
      <div class="card chat-window">
        <div class="chat-messages" id="chat-messages">
          ${messages.length === 0 ? `
            <div class="chat-msg assistant">
              <strong>Zoom-Fu Coach</strong><br><br>
              I'm your connection coach. Ask me anything about approaching people, building rapport, or following up.
            </div>
          ` : messages.map((m) => `
            <div class="chat-msg ${m.role}">
              ${m.role === 'assistant' ? renderMarkdownLite(m.content) : m.content}
            </div>
          `).join('')}
        </div>
        <form id="chat-form" class="chat-input-row">
          <input type="text" id="chat-input" placeholder="Ask your coach..." autocomplete="off">
          <button type="submit" class="btn btn-primary btn-sm">Send</button>
        </form>
      </div>
      <div class="card">
        <div class="section-title">Quick prompts</div>
        <div class="prompt-chips">
          ${COACH_PROMPTS.map((p) => `
            <button type="button" class="prompt-chip" data-coach-prompt="${p}">${p}</button>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm btn-block mt-1" id="clear-chat">Clear chat</button>
      </div>
    </div>
  `;
}

/* ─── Connection Score ─── */
function renderScore() {
  const score = getConnectionScore(state.dailyLogs, state.contacts);
  const todayLog = getTodayLog(state);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score.total / 100) * circumference;

  return `
    <div class="grid grid-2 mb-1">
      <div class="card score-hero">
        <svg width="0" height="0">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f5a623"/>
              <stop offset="100%" stop-color="#ff6b6b"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="score-ring-wrap">
          <svg class="score-ring" width="180" height="180" viewBox="0 0 180 180">
            <circle class="score-ring-bg" cx="90" cy="90" r="80"/>
            <circle class="score-ring-fill" cx="90" cy="90" r="80"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="score-number">
            <span class="value">${score.total}</span>
            <span class="label">/ 100</span>
          </div>
        </div>
        <h3>Zoom-Fu Score</h3>
        <p class="card-hint">Human Connection Score — updated from your daily activity</p>
      </div>

      <div class="card">
        <div class="section-title">Today's activity log</div>
        <form id="daily-log-form" class="daily-log-grid">
          <div class="field">
            <label>Conversations started</label>
            <input type="number" name="conversationsStarted" min="0" value="${todayLog.conversationsStarted}">
          </div>
          <div class="field">
            <label>Contacts collected</label>
            <input type="number" name="contactsCollected" min="0" value="${todayLog.contactsCollected}">
          </div>
          <div class="field">
            <label>Follow-ups sent</label>
            <input type="number" name="followUpsSent" min="0" value="${todayLog.followUpsSent}">
          </div>
          <div class="field">
            <label>Events attended</label>
            <input type="number" name="eventsAttended" min="0" value="${todayLog.eventsAttended}">
          </div>
          <button type="submit" class="btn btn-primary btn-block" style="grid-column:1/-1">Save today's log</button>
        </form>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="section-title">Score factors</div>
        ${[
          { key: 'courage', label: 'Courage', color: 'coral' },
          { key: 'initiation', label: 'Initiation', color: 'accent' },
          { key: 'followUp', label: 'Follow-up', color: 'teal' },
          { key: 'maintenance', label: 'Relationship maintenance', color: 'purple' },
        ].map((f) => `
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">${f.label}</span>
              <span class="progress-value">${score.factors[f.key]}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${f.color}" style="width:${score.factors[f.key]}%"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="section-title">Analysis</div>
        <div class="strength-weak">
          <div class="strong">
            <h4>Strong</h4>
            <ul>${score.strengths.map((s) => `<li>${s}</li>`).join('')}</ul>
          </div>
          <div class="weak">
            <h4>Weak</h4>
            <ul>${score.weaknesses.map((w) => `<li>${w}</li>`).join('')}</ul>
          </div>
        </div>
        <div class="recommendation mt-1">
          <div class="recommendation-icon">→</div>
          <span><strong>Recommended mission:</strong> ${score.recommendedMission}</span>
        </div>
      </div>
    </div>
  `;
}

/* ─── Render & Events ─── */
function render() {
  const views = {
    dashboard: renderDashboard,
    radar: renderRadar,
    mission: renderMission,
    sifting: renderSifting,
    crm: renderCrm,
    coach: renderCoach,
    score: renderScore,
  };
  $('#content').innerHTML = views[currentView]();
  updateSiftingBadge();
  bindViewEvents();
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const el = $('#chat-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

function sendCoachMessage(text) {
  if (!text.trim()) return;
  addChatMessage(state, 'user', text.trim());
  const response = getCoachResponse(text, { name: state.activeMission?.contactName });
  addChatMessage(state, 'assistant', response);
  render();
}

function showAddSiftCardModal(prefill = {}) {
  openModal('Add person to sift', `
    <form id="sift-card-form" class="form-grid">
      <div class="field">
        <label>Name *</label>
        <input type="text" id="sift-name" required value="${prefill.name || ''}">
      </div>
      <div class="field">
        <label>Context</label>
        <input type="text" id="sift-context" value="${prefill.context || ''}" placeholder="Met at Toastmasters">
      </div>
      <div class="field">
        <label>Notes</label>
        <textarea id="sift-notes" placeholder="Quick notes from conversation...">${prefill.notes || ''}</textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Add to queue</button>
    </form>
  `);

  $('#sift-card-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#sift-name').value.trim();
    if (!name) { showToast('Enter a name', 'error'); return; }
    addPendingCard(state, {
      name,
      context: $('#sift-context').value.trim(),
      notes: $('#sift-notes').value.trim(),
    });
    addXp(state, 5, `Added ${name} to sifting queue`);
    closeModal();
    showToast(`${name} added to sifting queue`);
    if (currentView !== 'sifting') navigate('sifting');
    else render();
  });
}

function showAddContactModal() {
  openModal('Add contact', `
    <form id="contact-form" class="form-grid">
      <div class="field"><label>Name *</label><input type="text" id="contact-name" required></div>
      <div class="field">
        <label>Tag</label>
        <select id="contact-tag">
          ${RELATIONSHIP_TAGS.filter((t) => t.key !== 'not-a-fit').map((t) =>
            `<option value="${t.key}">${t.icon} ${t.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="field"><label>Profession</label><input type="text" id="contact-profession"></div>
      <div class="field"><label>Notes</label><textarea id="contact-notes"></textarea></div>
      <div class="field"><label>Next action</label><input type="text" id="contact-action" placeholder="Invite to coffee"></div>
      <button type="submit" class="btn btn-primary btn-block">Save contact</button>
    </form>
  `);

  $('#contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#contact-name').value.trim();
    if (!name) return;
    addContact(state, {
      name,
      tags: [$('#contact-tag').value],
      profession: $('#contact-profession').value.trim(),
      notes: $('#contact-notes').value.trim(),
      nextAction: $('#contact-action').value.trim(),
      lastInteraction: new Date().toISOString().slice(0, 10),
    });
    closeModal();
    showToast(`${name} added to CRM`);
    render();
  });
}

function showEditContactModal(id) {
  const contact = state.contacts.find((c) => c.id === id);
  if (!contact) return;

  openModal(`Edit ${contact.name}`, `
    <form id="edit-contact-form" class="form-grid">
      <div class="field"><label>Name</label><input type="text" id="edit-name" value="${contact.name}"></div>
      <div class="field"><label>Profession</label><input type="text" id="edit-profession" value="${contact.profession || ''}"></div>
      <div class="field"><label>Notes</label><textarea id="edit-notes">${contact.notes || ''}</textarea></div>
      <div class="field"><label>Next action</label><input type="text" id="edit-action" value="${contact.nextAction || ''}"></div>
      <div class="field">
        <label>Last interaction</label>
        <input type="date" id="edit-last" value="${contact.lastInteraction || ''}">
      </div>
      <button type="submit" class="btn btn-primary btn-block">Save changes</button>
      <button type="button" class="btn btn-secondary btn-block" id="delete-contact">Delete contact</button>
    </form>
  `);

  $('#edit-contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateContact(state, id, {
      name: $('#edit-name').value.trim(),
      profession: $('#edit-profession').value.trim(),
      notes: $('#edit-notes').value.trim(),
      nextAction: $('#edit-action').value.trim(),
      lastInteraction: $('#edit-last').value,
    });
    closeModal();
    showToast('Contact updated');
    render();
  });

  $('#delete-contact').addEventListener('click', () => {
    deleteContact(state, id);
    closeModal();
    showToast('Contact removed');
    render();
  });
}

function showClassifyNotesModal(cardId, tag) {
  const card = state.pendingCards.find((c) => c.id === cardId);
  if (!card) return;

  if (tag === 'not-a-fit') {
    classifyPendingCard(state, cardId, tag);
    showToast(`${card.name} marked as not a fit`);
    render();
    return;
  }

  openModal(`Classify as ${tag}`, `
    <form id="classify-form" class="form-grid">
      <p class="card-hint">Adding <strong>${card.name}</strong> to your CRM as <strong>${tag}</strong>.</p>
      <div class="field">
        <label>Notes</label>
        <textarea id="classify-notes" placeholder="What did you learn?">${card.notes || ''}</textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Save to CRM</button>
    </form>
  `);

  $('#classify-form').addEventListener('submit', (e) => {
    e.preventDefault();
    classifyPendingCard(state, cardId, tag, $('#classify-notes').value.trim());
    closeModal();
    showToast(`${card.name} saved as ${tag}`, 'xp');
    render();
  });
}

function bindViewEvents() {
  $$('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  const radarForm = $('#radar-form');
  if (radarForm) {
    radarForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const context = $('#radar-context').value.trim();
      if (!context) { showToast('Describe where you are', 'error'); return; }
      const result = generateOpportunityRadar(context);
      setLastRadarResult(state, result);
      showToast('Opportunities scanned');
      render();
    });
  }

  $$('[data-radar-person]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.radarPerson;
      const context = btn.dataset.radarContext;
      const mission = generateConversationMission(name, context);
      setActiveMission(state, mission);
      addPendingCard(state, { name, context, notes: '' });
      showToast(`Mission started with ${name}`, 'xp');
      navigate('mission');
    });
  });

  const missionForm = $('#mission-form');
  if (missionForm) {
    missionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#mission-name').value.trim();
      const context = $('#mission-context').value.trim();
      if (!name) return;
      const mission = generateConversationMission(name, context);
      setActiveMission(state, mission);
      showToast(`Mission generated for ${name}`);
      render();
    });
  }

  $$('[data-objective-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.objectiveIdx);
      if (state.activeMission) {
        state.activeMission.objectives[idx].done = !state.activeMission.objectives[idx].done;
        setActiveMission(state, state.activeMission);
        render();
      }
    });
  });

  const completeBtn = $('#complete-mission');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      const mission = completeMission(state);
      if (mission) {
        logDailyActivity(state, {
          ...getTodayLog(state),
          conversationsStarted: getTodayLog(state).conversationsStarted + 1,
        });
        showToast(`+${mission.xpReward} XP — Mission complete!`, 'xp');
        render();
      }
    });
  }

  const cancelBtn = $('#cancel-mission');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      setActiveMission(state, null);
      showToast('Mission cancelled');
      render();
    });
  }

  $$('.sift-card').forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      draggedCardId = card.dataset.cardId;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedCardId = null;
    });
  });

  $$('.drop-zone').forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (draggedCardId) {
        showClassifyNotesModal(draggedCardId, zone.dataset.dropTag);
      }
    });
  });

  const addSiftBtn = $('#add-sift-card');
  if (addSiftBtn) {
    addSiftBtn.addEventListener('click', () => showAddSiftCardModal());
  }

  const addContactBtn = $('#add-contact-btn');
  if (addContactBtn) {
    addContactBtn.addEventListener('click', () => showAddContactModal());
  }

  $$('[data-edit-contact]').forEach((btn) => {
    btn.addEventListener('click', () => showEditContactModal(btn.dataset.editContact));
  });

  $$('[data-mission-contact]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mission = generateConversationMission(btn.dataset.missionContact);
      setActiveMission(state, mission);
      navigate('mission');
    });
  });

  const chatForm = $('#chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#chat-input');
      sendCoachMessage(input.value);
      input.value = '';
    });
  }

  $$('[data-coach-prompt]').forEach((btn) => {
    btn.addEventListener('click', () => sendCoachMessage(btn.dataset.coachPrompt));
  });

  const clearChatBtn = $('#clear-chat');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      clearChatHistory(state);
      showToast('Chat cleared');
      render();
    });
  }

  const dailyLogForm = $('#daily-log-form');
  if (dailyLogForm) {
    dailyLogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(dailyLogForm);
      logDailyActivity(state, {
        conversationsStarted: Number(fd.get('conversationsStarted')) || 0,
        contactsCollected: Number(fd.get('contactsCollected')) || 0,
        followUpsSent: Number(fd.get('followUpsSent')) || 0,
        eventsAttended: Number(fd.get('eventsAttended')) || 0,
      });
      showToast('Daily log saved — score updated');
      render();
    });
  }
}

function init() {
  $('#current-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  $$('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.view));
  });

  $('#menu-toggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
    $('#overlay').classList.toggle('visible');
  });

  $('#overlay').addEventListener('click', closeSidebar);

  $$('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  updateTopbarXp();
  render();
}

init();
