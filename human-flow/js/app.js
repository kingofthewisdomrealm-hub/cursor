import {
  OPENERS,
  QUALIFY_LINES,
  MESSAGE_LINES,
  ACTION_LINES,
  PERSONAS,
  STAGE_META,
  STAGES,
  getOpenerById,
} from './flow-data.js';

import {
  loadSessions,
  clearSessions,
  createSession,
  recordChoice,
  finalizeSession,
  rollOutcome,
  getAggregateFunnel,
  getDiscoveredStats,
  computeOpenerStats,
} from './flow-engine.js';

let sessions = loadSessions();
let activeSession = null;
let activePersona = null;
let pedestrians = [];
let pedestrianId = 0;
let animationFrame = null;
let lastTick = 0;
let selectedOpenerId = OPENERS[0].id;
let gamePhase = 'walking'; // walking | stopped | debrief
let debriefData = null;
let engageZoneActive = false;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function spawnPedestrian() {
  const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  const id = ++pedestrianId;
  pedestrians.push({
    id,
    persona,
    x: -80,
    state: 'walking',
    sessionId: null,
  });
}

function getEngageZone() {
  const scene = $('#street-scene');
  if (!scene) return { left: 0.35, right: 0.65 };
  return { left: 0.3, right: 0.7 };
}

function tickPedestrians(dt) {
  const scene = $('#street-scene');
  if (!scene || gamePhase !== 'walking') return;

  const width = scene.clientWidth;
  const zone = getEngageZone();

  pedestrians.forEach((p) => {
    if (p.state !== 'walking') return;
    const speed = 60 * p.persona.walkSpeed;
    p.x += speed * dt;

    const normX = p.x / width;
    engageZoneActive = pedestrians.some(
      (ped) => ped.state === 'walking' && ped.x / width >= zone.left && ped.x / width <= zone.right
    );
  });

  pedestrians = pedestrians.filter((p) => {
    if (p.state === 'walking' && p.x > width + 100) return false;
    return true;
  });

  if (gamePhase === 'walking' && pedestrians.length < 4 && Math.random() < 0.02) {
    spawnPedestrian();
  }

  renderPedestrians();
  updateEngageHint();
}

function renderPedestrians() {
  const layer = $('#pedestrian-layer');
  if (!layer) return;

  layer.innerHTML = pedestrians.map((p) => {
    const stopped = p.state === 'stopped';
    return `
      <div class="pedestrian ${stopped ? 'stopped' : ''}" style="left: ${p.x}px" data-id="${p.id}">
        <span class="ped-emoji">${p.persona.emoji}</span>
        <span class="ped-label">${stopped ? 'Stopped' : p.persona.label}</span>
      </div>
    `;
  }).join('');
}

function updateEngageHint() {
  const hint = $('#engage-hint');
  const fireBtn = $('#fire-opener');
  if (!hint) return;
  if (gamePhase !== 'walking') {
    hint.textContent = '';
    return;
  }
  hint.textContent = engageZoneActive
    ? 'Someone is in range — pick an opener'
    : 'Wait for someone to enter the zone…';
  hint.classList.toggle('ready', engageZoneActive);
  if (fireBtn) fireBtn.disabled = !engageZoneActive;
}

function getPedestrianInZone() {
  const scene = $('#street-scene');
  if (!scene) return null;
  const width = scene.clientWidth;
  const zone = getEngageZone();
  return pedestrians.find(
    (p) => p.state === 'walking' && p.x / width >= zone.left && p.x / width <= zone.right
  );
}

function renderPipeline(stage) {
  const idx = STAGES.indexOf(stage);
  return `
    <div class="pipeline">
      ${STAGES.map((s, i) => {
        const meta = STAGE_META[s];
        let state = 'future';
        if (i < idx) state = 'done';
        if (i === idx) state = 'current';
        return `
          <div class="pipe-step ${state}">
            <div class="pipe-num">${i + 1}</div>
            <div class="pipe-body">
              <strong>${meta.label}</strong>
              <span>${meta.goal}</span>
            </div>
          </div>
          ${i < STAGES.length - 1 ? '<div class="pipe-arrow">→</div>' : ''}
        `;
      }).join('')}
    </div>
  `;
}

function renderOpenerPanel() {
  const discovered = getDiscoveredStats(sessions, selectedOpenerId);
  return `
    <div class="panel openers-panel">
      <h3>Stage 1: Stop</h3>
      <p class="panel-sub">Your goal isn't to convince. It's to get them to <strong>stop moving</strong>.</p>
      <div class="opener-list">
        ${OPENERS.map((o) => `
          <button class="opener-btn ${o.id === selectedOpenerId ? 'selected' : ''}" data-opener="${o.id}">
            <span class="opener-text">"${o.text}"</span>
            ${o.id === selectedOpenerId && discovered ? `
              <span class="opener-stats">
                Stop ${discovered.stop} · Trust ${discovered.trust} · Curiosity ${discovered.curiosity} · Resistance ${discovered.resistance}
              </span>
            ` : ''}
          </button>
        `).join('')}
      </div>
      <button class="btn btn-primary btn-block" id="fire-opener" ${!engageZoneActive || gamePhase !== 'walking' ? 'disabled' : ''}>
        Use opener
      </button>
    </div>
  `;
}

function renderStageChoices(stage) {
  const lines = {
    qualify: QUALIFY_LINES,
    message: MESSAGE_LINES,
    action: ACTION_LINES,
  }[stage];

  if (!lines) return '';

  const meta = STAGE_META[stage];
  return `
    <div class="panel stage-panel">
      <h3>Stage ${STAGES.indexOf(stage) + 1}: ${meta.label}</h3>
      <p class="panel-sub">${meta.goal}</p>
      <div class="choice-list">
        ${lines.map((line) => `
          <button class="choice-btn" data-stage="${stage}" data-choice="${line.id}">
            "${line.text}"
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderFunnel() {
  const funnel = getAggregateFunnel(sessions);
  const max = Math.max(funnel.walks, 1);
  const steps = [
    { label: 'Walking', count: funnel.walks, pct: 100 },
    { label: 'Stopped', count: funnel.stops, pct: (funnel.stops / max) * 100 },
    { label: 'Listening', count: funnel.qualifies, pct: (funnel.qualifies / max) * 100 },
    { label: 'Engaged', count: funnel.messages, pct: (funnel.messages / max) * 100 },
    { label: 'Acting', count: funnel.actions, pct: (funnel.actions / max) * 100 },
  ];

  return `
    <div class="panel funnel-panel">
      <h3>Your pipeline</h3>
      <p class="panel-sub">Walking → Stopped → Listening → Acting</p>
      <div class="funnel-bars">
        ${steps.map((s) => `
          <div class="funnel-row">
            <span class="funnel-label">${s.label}</span>
            <div class="funnel-track"><div class="funnel-fill" style="width: ${s.pct}%"></div></div>
            <span class="funnel-count">${s.count}</span>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-ghost btn-sm" id="reset-stats">Reset stats</button>
    </div>
  `;
}

function renderDebrief() {
  if (!debriefData) return '';
  const { session, opener, success, stage, insight, persona } = debriefData;
  const openerStats = computeOpenerStats(sessions, session.openerId);

  return `
    <div class="debrief-overlay">
      <div class="debrief-card">
        ${success && session.result === 'action' ? `
          <div class="debrief-icon success">✓</div>
          <h2>Full pipeline</h2>
          <p>Walking → Stopped → Listening → Engaged → <strong>Acting</strong></p>
        ` : !success ? `
          <div class="debrief-icon bail">✕</div>
          <h2>They kept walking</h2>
          <p>Bailed at <strong>${STAGE_META[stage]?.label ?? stage}</strong></p>
        ` : `
          <div class="debrief-icon partial">→</div>
          <h2>Moving forward</h2>
          <p>Next: ${STAGE_META[session.currentStage]?.label ?? session.currentStage}</p>
        `}

        <div class="debrief-detail">
          <p><strong>Opener:</strong> "${opener.text}"</p>
          <p><strong>Persona:</strong> ${persona.emoji} ${persona.label}</p>
          ${insight ? `<p class="insight">💡 ${insight}</p>` : ''}
        </div>

        <div class="debrief-stats">
          <span>Your stop rate: ${Math.round(openerStats.stopRate * 100)}%</span>
          <span>Action rate: ${Math.round(openerStats.actionRate * 100)}%</span>
        </div>

        <button class="btn btn-primary btn-block" id="debrief-continue">
          ${session.result ? 'Next person' : 'Continue'}
        </button>
      </div>
    </div>
  `;
}

function render() {
  const app = $('#app');
  const sidePanel = gamePhase === 'walking'
    ? renderOpenerPanel()
    : activeSession && activeSession.currentStage !== 'stop'
      ? renderStageChoices(activeSession.currentStage)
      : '';

  app.innerHTML = `
    <header class="header">
      <div class="brand">
        <span class="brand-mark">⬡</span>
        <div>
          <h1>Human Flow Simulator</h1>
          <p>Stop → Qualify → Message → Action</p>
        </div>
      </div>
      <div class="header-note">
        The opener isn't the sale. It's the brake pedal.
      </div>
    </header>

    <div class="layout">
      <section class="scene-section">
        ${renderPipeline(activeSession?.currentStage ?? 'stop')}
        <div class="street-scene" id="street-scene">
          <div class="engage-zone" aria-hidden="true"></div>
          <div class="you-marker">
            <span>You</span>
          </div>
          <div class="pedestrian-layer" id="pedestrian-layer"></div>
        </div>
        <p class="engage-hint" id="engage-hint"></p>
      </section>

      <aside class="side-section">
        ${sidePanel}
        ${renderFunnel()}
      </aside>
    </div>

    ${renderDebrief()}
  `;

  bindEvents();
  renderPedestrians();
  updateEngageHint();
}

function bindEvents() {
  $$('[data-opener]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedOpenerId = btn.dataset.opener;
      render();
    });
  });

  const fireBtn = $('#fire-opener');
  if (fireBtn) {
    fireBtn.addEventListener('click', fireOpener);
  }

  $$('[data-choice]').forEach((btn) => {
    btn.addEventListener('click', () => handleStageChoice(btn.dataset.stage, btn.dataset.choice));
  });

  const debriefBtn = $('#debrief-continue');
  if (debriefBtn) {
    debriefBtn.addEventListener('click', closeDebrief);
  }

  const resetBtn = $('#reset-stats');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all session stats?')) {
        clearSessions();
        sessions = [];
        render();
      }
    });
  }
}

function fireOpener() {
  const ped = getPedestrianInZone();
  if (!ped || gamePhase !== 'walking') return;

  const opener = getOpenerById(selectedOpenerId);
  activePersona = ped.persona;
  activeSession = createSession(opener.id, ped.persona.id);

  const stopped = rollOutcome(opener.stats.stop, ped.persona, 'stop');

  ped.state = stopped ? 'stopped' : 'walking';
  if (!stopped) {
    recordChoice(activeSession, 'stop', opener.id, opener.text, false);
    finalizeSession(activeSession);
    sessions = loadSessions();
    showDebrief({
      session: activeSession,
      opener,
      persona: ped.persona,
      success: false,
      stage: 'stop',
      insight: 'They kept walking. Try a lower-resistance opener or wait for a friendlier persona.',
    });
    setTimeout(() => { pedestrians = pedestrians.filter((p) => p.id !== ped.id); }, 600);
    return;
  }

  recordChoice(activeSession, 'stop', opener.id, opener.text, true);
  gamePhase = 'stopped';
  ped.sessionId = activeSession.id;
  showDebrief({
    session: activeSession,
    opener,
    persona: ped.persona,
    success: true,
    stage: 'stop',
    insight: opener.insight,
  });
}

function handleStageChoice(stage, choiceId) {
  const lines = { qualify: QUALIFY_LINES, message: MESSAGE_LINES, action: ACTION_LINES }[stage];
  const line = lines.find((l) => l.id === choiceId);
  if (!line || !activeSession) return;

  const statKey = stage === 'qualify' ? 'qualify' : stage === 'message' ? 'engage' : 'convert';
  const statLevel = line.stats[statKey] ?? line.stats.trust ?? 'medium';
  const success = rollOutcome(statLevel, activePersona, statKey === 'convert' ? 'resistance' : 'trust');

  recordChoice(activeSession, stage, choiceId, line.text, success);

  if (!success) {
    finalizeSession(activeSession);
    sessions = loadSessions();
    showDebrief({
      session: activeSession,
      opener: getOpenerById(activeSession.openerId),
      persona: activePersona,
      success: false,
      stage,
      insight: line.insight,
    });
    return;
  }

  if (activeSession.result === 'action') {
    finalizeSession(activeSession);
    sessions = loadSessions();
    showDebrief({
      session: activeSession,
      opener: getOpenerById(activeSession.openerId),
      persona: activePersona,
      success: true,
      stage: 'action',
      insight: line.insight ?? 'You moved them through the full pipeline.',
    });
    return;
  }

  render();
}

function showDebrief(data) {
  debriefData = data;
  gamePhase = 'debrief';
  render();
}

function closeDebrief() {
  debriefData = null;

  if (activeSession?.result) {
    activeSession = null;
    activePersona = null;
    gamePhase = 'walking';
    pedestrians = pedestrians.filter((p) => p.state !== 'stopped');
    spawnPedestrian();
  } else if (activeSession && !activeSession.result) {
    gamePhase = 'stopped';
  } else {
    gamePhase = 'walking';
  }

  render();
}

function gameLoop(ts) {
  if (!lastTick) lastTick = ts;
  const dt = Math.min((ts - lastTick) / 1000, 0.05);
  lastTick = ts;
  tickPedestrians(dt);
  animationFrame = requestAnimationFrame(gameLoop);
}

function init() {
  for (let i = 0; i < 3; i++) {
    const p = PERSONAS[i % PERSONAS.length];
    pedestrians.push({
      id: ++pedestrianId,
      persona: p,
      x: -80 - i * 180,
      state: 'walking',
      sessionId: null,
    });
  }
  render();
  animationFrame = requestAnimationFrame(gameLoop);
}

init();
