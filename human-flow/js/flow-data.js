/** Human Flow Simulator — content & hidden opener stats */

export const STAGES = ['stop', 'qualify', 'message', 'action'];

export const STAGE_META = {
  stop: {
    label: 'Stop',
    goal: 'Did they stop?',
    pipeline: 'Walking → Stopped',
  },
  qualify: {
    label: 'Qualify',
    goal: 'Are they the right prospect?',
    pipeline: 'Stopped → Listening',
  },
  message: {
    label: 'Message',
    goal: 'Do they stay engaged?',
    pipeline: 'Listening → Engaged',
  },
  action: {
    label: 'Action',
    goal: 'Did they act?',
    pipeline: 'Engaged → Acting',
  },
};

/** High / Medium / Low → numeric weight for display */
export const STAT_LEVELS = { high: 0.8, medium: 0.55, low: 0.3 };

export const OPENERS = [
  {
    id: 'need-support',
    text: 'Sir/Ma\'am, we need your support.',
    stats: { stop: 'high', trust: 'medium', curiosity: 'low', resistance: 'low' },
    insight: 'Not a persuasion line — a brake pedal. You\'re not selling yet.',
  },
  {
    id: 'quick-question',
    text: 'Ma\'am, quick question.',
    stats: { stop: 'medium', trust: 'medium', curiosity: 'medium', resistance: 'low' },
    insight: 'Low threat, medium curiosity. Good when they look busy but not hostile.',
  },
  {
    id: 'california-voter',
    text: 'Are you a California voter?',
    stats: { stop: 'medium', trust: 'high', curiosity: 'medium', resistance: 'medium' },
    insight: 'Feels legitimate. High trust, but some people dodge political questions.',
  },
  {
    id: 'excuse-me-help',
    text: 'Excuse me, can I get your help?',
    stats: { stop: 'high', trust: 'medium', curiosity: 'medium', resistance: 'low' },
    insight: 'Asking for help triggers reciprocity. Strong stop rate.',
  },
  {
    id: 'sign-petition',
    text: 'Would you sign this petition?',
    stats: { stop: 'high', trust: 'low', curiosity: 'low', resistance: 'high' },
    insight: 'High stop — they pause from surprise — but low trust and high resistance. You skipped the pipeline.',
  },
  {
    id: 'stop-newsom',
    text: 'STOP NEWSOM — want to sign?',
    stats: { stop: 'high', trust: 'low', curiosity: 'high', resistance: 'high' },
    insight: 'The billboard, not the conversion. Stops them; doesn\'t close them.',
  },
];

export const QUALIFY_LINES = [
  {
    id: 'registered-ca',
    text: 'Are you registered to vote in California?',
    stats: { qualify: 'high', trust: 'high', resistance: 'low' },
  },
  {
    id: 'live-district',
    text: 'Do you live in this district?',
    stats: { qualify: 'high', trust: 'medium', resistance: 'medium' },
  },
  {
    id: 'own-home',
    text: 'Do you own a home?',
    stats: { qualify: 'medium', trust: 'medium', resistance: 'medium' },
  },
  {
    id: 'skip-qualify',
    text: 'So anyway, we\'re gathering signatures…',
    stats: { qualify: 'low', trust: 'low', resistance: 'high' },
    insight: 'Skipping qualify burns trust. Wrong prospects waste your time.',
  },
];

export const MESSAGE_LINES = [
  {
    id: 'gathering-signatures',
    text: 'We\'re gathering signatures to put this on the ballot.',
    stats: { engage: 'high', trust: 'high', resistance: 'low' },
  },
  {
    id: 'help-homeowners',
    text: 'We\'re helping homeowners lower their property tax burden.',
    stats: { engage: 'high', trust: 'medium', resistance: 'low' },
  },
  {
    id: 'podcast-guests',
    text: 'We\'re looking for podcast guests who own small businesses.',
    stats: { engage: 'medium', trust: 'medium', resistance: 'medium' },
  },
  {
    id: 'hard-sell',
    text: 'This is really important and you need to sign right now.',
    stats: { engage: 'low', trust: 'low', resistance: 'high' },
    insight: 'Pressure kills engagement. They stopped — don\'t punish them for it.',
  },
];

export const ACTION_LINES = [
  {
    id: 'sign',
    text: 'Would you sign here? It only takes a moment.',
    stats: { convert: 'high', trust: 'medium', resistance: 'low' },
  },
  {
    id: 'book',
    text: 'Can I book you for a 15-minute call this week?',
    stats: { convert: 'medium', trust: 'medium', resistance: 'medium' },
  },
  {
    id: 'subscribe',
    text: 'Want to subscribe to stay updated?',
    stats: { convert: 'medium', trust: 'high', resistance: 'low' },
  },
  {
    id: 'aggressive-close',
    text: 'Come on, it\'ll take two seconds. Everyone\'s doing it.',
    stats: { convert: 'low', trust: 'low', resistance: 'high' },
    insight: 'Social pressure backfires after you earned their attention.',
  },
];

export const PERSONAS = [
  {
    id: 'commuter',
    label: 'Rushed commuter',
    emoji: '🏃',
    modifiers: { stop: -0.15, trust: -0.05, curiosity: -0.1, resistance: 0.15 },
    walkSpeed: 1.4,
  },
  {
    id: 'shopper',
    label: 'Curious shopper',
    emoji: '🛍️',
    modifiers: { stop: 0.05, trust: 0, curiosity: 0.15, resistance: -0.05 },
    walkSpeed: 1.0,
  },
  {
    id: 'neighbor',
    label: 'Friendly neighbor',
    emoji: '👋',
    modifiers: { stop: 0.1, trust: 0.15, curiosity: 0.05, resistance: -0.15 },
    walkSpeed: 0.85,
  },
  {
    id: 'skeptic',
    label: 'Political skeptic',
    emoji: '🤨',
    modifiers: { stop: -0.05, trust: -0.2, curiosity: 0.1, resistance: 0.2 },
    walkSpeed: 1.1,
  },
  {
    id: 'parent',
    label: 'Parent with kids',
    emoji: '👨‍👧',
    modifiers: { stop: 0, trust: 0.05, curiosity: -0.05, resistance: 0.1 },
    walkSpeed: 0.75,
  },
];

export function statToNumber(level) {
  return STAT_LEVELS[level] ?? 0.5;
}

export function getOpenerById(id) {
  return OPENERS.find((o) => o.id === id);
}
