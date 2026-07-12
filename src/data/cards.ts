import type { ComedyCard } from '../types';

export const ALL_CARDS: ComedyCard[] = [
  // Observations — starter
  {
    id: 'obs-airport',
    type: 'observation',
    text: 'Airport security treats everyone like they just robbed a bank.',
    attributes: { relatability: 9, surprise: 4, specificity: 7, originality: 5, brevity: 8 },
    unlockCost: 0,
  },
  {
    id: 'obs-dating-apps',
    type: 'observation',
    text: 'Dating apps feel like a job interview where both people are lying on their résumé.',
    attributes: { relatability: 8, surprise: 5, specificity: 8, originality: 6, brevity: 7 },
    unlockCost: 0,
  },
  {
    id: 'obs-gym',
    type: 'observation',
    text: 'The gym is the only place where grunting at strangers is socially acceptable.',
    attributes: { relatability: 7, surprise: 6, specificity: 6, originality: 7, brevity: 8 },
    unlockCost: 0,
  },
  // Observations — unlockable
  {
    id: 'obs-wifi',
    type: 'observation',
    text: 'My Wi-Fi password has more commitment than my last three relationships.',
    attributes: { relatability: 8, surprise: 7, specificity: 7, originality: 8, brevity: 7 },
    unlockCost: 50,
  },
  {
    id: 'obs-coffee',
    type: 'observation',
    text: 'I don\'t have a caffeine addiction — I have a personality that requires a stimulant.',
    attributes: { relatability: 9, surprise: 6, specificity: 6, originality: 7, brevity: 8 },
    unlockCost: 100,
  },
  {
    id: 'obs-parents',
    type: 'observation',
    text: 'My parents still think "the cloud" is a weather phenomenon that stores their photos.',
    attributes: { relatability: 7, surprise: 5, specificity: 8, originality: 6, brevity: 7 },
    unlockCost: 150,
  },

  // Techniques — starter
  {
    id: 'tech-misdirection',
    type: 'technique',
    text: 'Misdirection — set up one expectation, then flip it.',
    attributes: { relatability: 5, surprise: 9, specificity: 6, originality: 7, brevity: 6 },
    unlockCost: 0,
  },
  {
    id: 'tech-exaggeration',
    type: 'technique',
    text: 'Exaggeration — take the truth and crank it to eleven.',
    attributes: { relatability: 6, surprise: 6, specificity: 5, originality: 5, brevity: 7 },
    unlockCost: 0,
  },
  {
    id: 'tech-callback',
    type: 'technique',
    text: 'Callback — reference something from earlier in the set.',
    attributes: { relatability: 5, surprise: 7, specificity: 7, originality: 8, brevity: 5 },
    unlockCost: 0,
  },
  // Techniques — unlockable
  {
    id: 'tech-rule-of-three',
    type: 'technique',
    text: 'Rule of Three — two normal beats, then the absurd third.',
    attributes: { relatability: 6, surprise: 8, specificity: 7, originality: 7, brevity: 6 },
    unlockCost: 50,
  },
  {
    id: 'tech-self-deprecation',
    type: 'technique',
    text: 'Self-Deprecation — make yourself the punchline before they can.',
    attributes: { relatability: 8, surprise: 4, specificity: 5, originality: 5, brevity: 7 },
    unlockCost: 100,
  },
  {
    id: 'tech-deadpan',
    type: 'technique',
    text: 'Deadpan — deliver the wildest line like you\'re reading a grocery list.',
    attributes: { relatability: 6, surprise: 9, specificity: 6, originality: 8, brevity: 8 },
    unlockCost: 150,
  },

  // Punchlines — starter
  {
    id: 'punch-plot-twist',
    type: 'punchline',
    text: '...turns out I was the villain the whole time.',
    attributes: { relatability: 6, surprise: 8, specificity: 5, originality: 7, brevity: 9 },
    unlockCost: 0,
  },
  {
    id: 'punch-absurd',
    type: 'punchline',
    text: '...and that\'s why I\'m banned from three Walmarts and a church.',
    attributes: { relatability: 5, surprise: 9, specificity: 8, originality: 8, brevity: 7 },
    unlockCost: 0,
  },
  {
    id: 'punch-truth-bomb',
    type: 'punchline',
    text: '...which is exactly what my therapist said, right before she quit.',
    attributes: { relatability: 7, surprise: 7, specificity: 7, originality: 7, brevity: 8 },
    unlockCost: 0,
  },
  // Punchlines — unlockable
  {
    id: 'punch-dark',
    type: 'punchline',
    text: '...so now the goldfish is in charge and honestly? Better leadership.',
    attributes: { relatability: 5, surprise: 9, specificity: 7, originality: 9, brevity: 7 },
    unlockCost: 50,
  },
  {
    id: 'punch-wholesome',
    type: 'punchline',
    text: '...and my grandma said, "See? You\'re not completely useless."',
    attributes: { relatability: 8, surprise: 5, specificity: 6, originality: 6, brevity: 8 },
    unlockCost: 100,
  },
  {
    id: 'punch-killer',
    type: 'punchline',
    text: '...I didn\'t bomb — I performed a controlled demolition of my dignity.',
    attributes: { relatability: 7, surprise: 8, specificity: 8, originality: 9, brevity: 7 },
    unlockCost: 150,
  },
];

export const STARTER_CARD_IDS = ALL_CARDS.filter((c) => c.unlockCost === 0).map((c) => c.id);

export function getCardById(id: string): ComedyCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function getCardsByType(type: ComedyCard['type']): ComedyCard[] {
  return ALL_CARDS.filter((c) => c.type === type);
}
