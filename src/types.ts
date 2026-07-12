export type CardType = 'observation' | 'technique' | 'punchline';

export interface CardAttributes {
  relatability: number;
  surprise: number;
  specificity: number;
  originality: number;
  brevity: number;
}

export interface ComedyCard {
  id: string;
  type: CardType;
  text: string;
  attributes: CardAttributes;
  unlockCost: number;
}

export interface StageSlots {
  observation: string | null;
  technique: string | null;
  punchline: string | null;
}

export interface JokeScores {
  laughScore: number;
  killTonyScore: number;
  laughPointsEarned: number;
  reaction: AudienceReaction;
}

export type AudienceReaction = 'crickets' | 'chuckle' | 'laugh' | 'roar' | 'kill';

export interface GameState {
  laughPoints: number;
  unlockedCardIds: string[];
  jokesPerformed: number;
  bestLaughScore: number;
  bestKillTonyScore: number;
  stage: StageSlots;
}

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  observation: 'Observation',
  technique: 'Technique',
  punchline: 'Punchline',
};

export const CARD_TYPE_COLORS: Record<CardType, string> = {
  observation: 'bg-card-obs',
  technique: 'bg-card-tech',
  punchline: 'bg-card-punch',
};

export const REACTION_CONFIG: Record<
  AudienceReaction,
  { emoji: string; label: string; color: string }
> = {
  crickets: { emoji: '🦗', label: 'Crickets...', color: 'text-slate-400' },
  chuckle: { emoji: '😅', label: 'Polite Chuckle', color: 'text-yellow-400' },
  laugh: { emoji: '😂', label: 'Big Laugh!', color: 'text-green-400' },
  roar: { emoji: '🔥', label: 'Roaring Crowd!', color: 'text-orange-400' },
  kill: { emoji: '☠️', label: 'YOU KILLED!', color: 'text-gold' },
};
