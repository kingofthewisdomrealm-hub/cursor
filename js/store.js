const STORAGE_KEY = 'zoom-fu-data';

const DEFAULT_STATE = {
  archetypeStats: { king: 12, warrior: 18, lover: 9, magician: 15 },
  contacts: [
    {
      id: 'seed-sarah',
      name: 'Sarah',
      photo: null,
      tags: ['mentor'],
      notes: 'Met at Toastmasters. Owns a marketing agency.',
      profession: 'Marketing agency owner',
      biggestGoal: 'Scale to 50 employees',
      biggestChallenge: 'Finding senior talent',
      lastInteraction: daysAgoISO(12),
      nextAction: 'Invite to coffee',
      createdAt: daysAgoISO(30),
      sourceContext: 'Toastmasters meeting',
    },
    {
      id: 'seed-john',
      name: 'John',
      photo: null,
      tags: ['mentor'],
      notes: 'Serial entrepreneur, generous with advice.',
      profession: 'SaaS founder',
      biggestGoal: '',
      biggestChallenge: '',
      lastInteraction: daysAgoISO(5),
      nextAction: 'Ask about fundraising journey',
      createdAt: daysAgoISO(20),
      sourceContext: 'Toastmasters meeting',
    },
    {
      id: 'seed-mike',
      name: 'Mike',
      photo: null,
      tags: ['friend'],
      notes: 'Hiking buddy, loves sci-fi.',
      profession: 'Software engineer',
      biggestGoal: '',
      biggestChallenge: '',
      lastInteraction: daysAgoISO(3),
      nextAction: 'Plan weekend hike',
      createdAt: daysAgoISO(45),
      sourceContext: 'Meetup group',
    },
    {
      id: 'seed-rebecca',
      name: 'Rebecca',
      photo: null,
      tags: ['client'],
      notes: 'Needs help with presentation skills.',
      profession: 'Product manager',
      biggestGoal: 'Leadership role',
      biggestChallenge: 'Public speaking anxiety',
      lastInteraction: daysAgoISO(8),
      nextAction: 'Send coaching proposal',
      createdAt: daysAgoISO(14),
      sourceContext: 'Toastmasters meeting',
    },
  ],
  pendingCards: [],
  missions: [],
  dailyLogs: [],
  xpLog: [
    { id: 'seed-xp-1', amount: 25, reason: 'Completed mission with Sarah', date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() },
    { id: 'seed-xp-2', amount: 15, reason: 'Classified Mike as friend', date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() },
    { id: 'seed-xp-3', amount: 5, reason: 'Added Rebecca to sifting queue', date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() },
  ],
  chatHistory: [],
  activeMission: null,
  lastRadarResult: null,
  settings: { userName: '' },
};

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      archetypeStats: { ...DEFAULT_STATE.archetypeStats, ...parsed.archetypeStats },
      contacts: parsed.contacts ?? [],
      pendingCards: parsed.pendingCards ?? [],
      missions: parsed.missions ?? [],
      dailyLogs: parsed.dailyLogs ?? [],
      xpLog: parsed.xpLog ?? [],
      chatHistory: parsed.chatHistory ?? [],
      activeMission: parsed.activeMission ?? null,
      lastRadarResult: parsed.lastRadarResult ?? null,
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addXp(state, amount, reason) {
  const entry = {
    id: generateId(),
    amount,
    reason,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  state.xpLog.push(entry);
  saveState(state);
  return entry;
}

export function getTodayXpTotal(state) {
  const today = new Date().toISOString().slice(0, 10);
  return state.xpLog
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function addContact(state, contact) {
  const entry = {
    id: generateId(),
    photo: null,
    tags: [],
    notes: '',
    profession: '',
    biggestGoal: '',
    biggestChallenge: '',
    lastInteraction: new Date().toISOString().slice(0, 10),
    nextAction: '',
    createdAt: new Date().toISOString(),
    sourceContext: '',
    ...contact,
  };
  state.contacts.push(entry);
  saveState(state);
  return entry;
}

export function updateContact(state, id, updates) {
  const idx = state.contacts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  state.contacts[idx] = { ...state.contacts[idx], ...updates };
  saveState(state);
  return state.contacts[idx];
}

export function deleteContact(state, id) {
  state.contacts = state.contacts.filter((c) => c.id !== id);
  saveState(state);
}

export function addPendingCard(state, card) {
  const entry = { id: generateId(), createdAt: new Date().toISOString(), ...card };
  state.pendingCards.push(entry);
  saveState(state);
  return entry;
}

export function removePendingCard(state, id) {
  state.pendingCards = state.pendingCards.filter((c) => c.id !== id);
  saveState(state);
}

export function classifyPendingCard(state, cardId, tag, notes = '') {
  const card = state.pendingCards.find((c) => c.id === cardId);
  if (!card) return null;

  if (tag !== 'not-a-fit') {
    addContact(state, {
      name: card.name,
      tags: [tag],
      notes: notes || card.notes || '',
      sourceContext: card.context || '',
      lastInteraction: new Date().toISOString().slice(0, 10),
    });
    addXp(state, 15, `Classified ${card.name} as ${tag}`);
  }

  removePendingCard(state, cardId);
  return card;
}

export function setActiveMission(state, mission) {
  state.activeMission = mission;
  saveState(state);
}

export function completeMission(state) {
  if (!state.activeMission) return null;
  const mission = state.activeMission;
  addXp(state, mission.xpReward || 25, `Completed mission with ${mission.contactName}`);
  state.archetypeStats.warrior = (state.archetypeStats.warrior || 0) + 1;
  state.archetypeStats.magician = (state.archetypeStats.magician || 0) + 1;
  state.activeMission = null;
  saveState(state);
  return mission;
}

export function logDailyActivity(state, activity) {
  const today = new Date().toISOString().slice(0, 10);
  let log = state.dailyLogs.find((l) => l.date === today);
  if (!log) {
    log = {
      date: today,
      conversationsStarted: 0,
      contactsCollected: 0,
      followUpsSent: 0,
      eventsAttended: 0,
    };
    state.dailyLogs.push(log);
  }
  Object.assign(log, activity);
  saveState(state);
  return log;
}

export function getTodayLog(state) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    state.dailyLogs.find((l) => l.date === today) ?? {
      date: today,
      conversationsStarted: 0,
      contactsCollected: 0,
      followUpsSent: 0,
      eventsAttended: 0,
    }
  );
}

export function addChatMessage(state, role, content) {
  const msg = { id: generateId(), role, content, createdAt: new Date().toISOString() };
  state.chatHistory.push(msg);
  saveState(state);
  return msg;
}

export function clearChatHistory(state) {
  state.chatHistory = [];
  saveState(state);
}

export function setLastRadarResult(state, result) {
  state.lastRadarResult = result;
  saveState(state);
}

export function updateSettings(state, settings) {
  state.settings = { ...state.settings, ...settings };
  saveState(state);
}

export const RELATIONSHIP_TAGS = [
  { key: 'mentor', label: 'Mentor', icon: '🏛' },
  { key: 'friend', label: 'Friend', icon: '🤝' },
  { key: 'client', label: 'Client', icon: '💼' },
  { key: 'romantic', label: 'Romantic', icon: '❤️' },
  { key: 'collaborator', label: 'Collaborator', icon: '🤜' },
  { key: 'not-a-fit', label: 'Not a Fit', icon: '✕' },
];

export const ARCHETYPES = [
  { key: 'king', label: 'King', icon: '👑' },
  { key: 'warrior', label: 'Warrior', icon: '⚔️' },
  { key: 'lover', label: 'Lover', icon: '❤️' },
  { key: 'magician', label: 'Magician', icon: '🧙' },
];
