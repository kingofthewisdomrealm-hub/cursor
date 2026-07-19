import {
  statToNumber,
  STAGES,
  getOpenerById,
} from './flow-data.js';

const STORAGE_KEY = 'human-flow-simulator';

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session) {
  const sessions = loadSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-200)));
}

export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Roll outcome for a choice given base stat level and persona modifiers.
 * @param {string} statLevel - 'high' | 'medium' | 'low'
 * @param {object} persona - pedestrian persona
 * @param {string} statKey - which modifier to apply (stop, trust, etc.)
 */
export function rollOutcome(statLevel, persona, statKey = 'stop') {
  const base = statToNumber(statLevel);
  const mod = persona?.modifiers?.[statKey] ?? 0;
  const chance = Math.min(0.95, Math.max(0.05, base + mod));
  return Math.random() < chance;
}

export function computeOpenerStats(sessions, openerId) {
  const runs = sessions.filter((s) => s.openerId === openerId);
  if (!runs.length) {
    return { attempts: 0, stopRate: 0, qualifyRate: 0, messageRate: 0, actionRate: 0 };
  }

  const reached = (s, stage) => s.choices.some((c) => c.stage === stage && c.success);
  const stopped = runs.filter((s) => reached(s, 'stop')).length;
  const qualified = runs.filter((s) => reached(s, 'qualify')).length;
  const messaged = runs.filter((s) => reached(s, 'message')).length;
  const acted = runs.filter((s) => s.result === 'action').length;

  return {
    attempts: runs.length,
    stopRate: stopped / runs.length,
    qualifyRate: qualified / runs.length,
    messageRate: messaged / runs.length,
    actionRate: acted / runs.length,
  };
}

export function createSession(openerId, personaId) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    openerId,
    personaId,
    startedAt: Date.now(),
    currentStage: 'stop',
    choices: [],
    result: null,
    bailReason: null,
  };
}

export function recordChoice(session, stage, choiceId, text, success) {
  session.choices.push({ stage, choiceId, text, success, at: Date.now() });
  if (!success) {
    session.result = 'bail';
    session.bailReason = stage;
    return session;
  }
  const idx = STAGES.indexOf(stage);
  if (idx < STAGES.length - 1) {
    session.currentStage = STAGES[idx + 1];
  } else {
    session.result = 'action';
    session.endedAt = Date.now();
  }
  return session;
}

export function finalizeSession(session) {
  if (!session.endedAt) session.endedAt = Date.now();
  saveSession(session);
  return session;
}

export function getAggregateFunnel(sessions) {
  if (!sessions.length) {
    return { walks: 0, stops: 0, qualifies: 0, messages: 0, actions: 0 };
  }
  return {
    walks: sessions.length,
    stops: sessions.filter((s) => s.choices.some((c) => c.stage === 'stop' && c.success)).length,
    qualifies: sessions.filter((s) => s.choices.some((c) => c.stage === 'qualify' && c.success)).length,
    messages: sessions.filter((s) => s.choices.some((c) => c.stage === 'message' && c.success)).length,
    actions: sessions.filter((s) => s.result === 'action').length,
  };
}

export function getDiscoveredStats(sessions, openerId) {
  const opener = getOpenerById(openerId);
  if (!opener) return null;
  const stats = computeOpenerStats(sessions, openerId);
  const attempts = stats.attempts;
  const revealThreshold = (n) => attempts >= n;

  return {
    attempts,
    stop: revealThreshold(3) ? opener.stats.stop : '?',
    trust: revealThreshold(5) ? opener.stats.trust : '?',
    curiosity: revealThreshold(7) ? opener.stats.curiosity : '?',
    resistance: revealThreshold(10) ? opener.stats.resistance : '?',
    measured: {
      stopRate: stats.stopRate,
      qualifyRate: stats.qualifyRate,
      messageRate: stats.messageRate,
      actionRate: stats.actionRate,
    },
  };
}
