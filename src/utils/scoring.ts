import type { CardAttributes, AudienceReaction, ComedyCard } from '../types';

const LAUGH_WEIGHTS: Record<keyof CardAttributes, number> = {
  relatability: 0.25,
  surprise: 0.2,
  specificity: 0.15,
  originality: 0.2,
  brevity: 0.2,
};

const KILL_TONY_WEIGHTS: Record<keyof CardAttributes, number> = {
  relatability: 0.1,
  surprise: 0.3,
  specificity: 0.25,
  originality: 0.25,
  brevity: 0.1,
};

function weightedAverage(
  attrs: CardAttributes,
  weights: Record<keyof CardAttributes, number>,
): number {
  let sum = 0;
  let weightSum = 0;
  for (const key of Object.keys(attrs) as (keyof CardAttributes)[]) {
    sum += attrs[key] * weights[key];
    weightSum += weights[key];
  }
  return (sum / weightSum) * 10;
}

function averageAttributes(cards: ComedyCard[]): CardAttributes {
  const keys = Object.keys(cards[0].attributes) as (keyof CardAttributes)[];
  const result = {} as CardAttributes;
  for (const key of keys) {
    result[key] = cards.reduce((acc, c) => acc + c.attributes[key], 0) / cards.length;
  }
  return result;
}

function synergyBonus(cards: ComedyCard[]): number {
  const types = new Set(cards.map((c) => c.type));
  if (types.size < 3) return 0;

  const avgSurprise = cards.reduce((a, c) => a + c.attributes.surprise, 0) / 3;
  const avgOriginality = cards.reduce((a, c) => a + c.attributes.originality, 0) / 3;

  let bonus = 0;
  if (avgSurprise >= 7) bonus += 5;
  if (avgOriginality >= 7) bonus += 5;

  const minBrevity = Math.min(...cards.map((c) => c.attributes.brevity));
  if (minBrevity >= 7) bonus += 3;

  return bonus;
}

function getReaction(laughScore: number, killTonyScore: number): AudienceReaction {
  if (killTonyScore >= 85) return 'kill';
  if (laughScore >= 75) return 'roar';
  if (laughScore >= 55) return 'laugh';
  if (laughScore >= 35) return 'chuckle';
  return 'crickets';
}

function calculateLaughPoints(laughScore: number, killTonyScore: number): number {
  const base = Math.floor(laughScore / 5);
  const killBonus = killTonyScore >= 85 ? 25 : killTonyScore >= 70 ? 10 : 0;
  return base + killBonus;
}

export function scoreJoke(cards: ComedyCard[]) {
  const combined = averageAttributes(cards);
  const synergy = synergyBonus(cards);

  const laughScore = Math.min(100, Math.round(weightedAverage(combined, LAUGH_WEIGHTS) + synergy));
  const killTonyScore = Math.min(
    100,
    Math.round(weightedAverage(combined, KILL_TONY_WEIGHTS) + synergy * 1.2),
  );

  const reaction = getReaction(laughScore, killTonyScore);
  const laughPointsEarned = calculateLaughPoints(laughScore, killTonyScore);

  return { laughScore, killTonyScore, laughPointsEarned, reaction };
}

export function getUnlockableCards(
  allCards: ComedyCard[],
  unlockedIds: string[],
  laughPoints: number,
): ComedyCard[] {
  return allCards.filter(
    (c) => !unlockedIds.includes(c.id) && c.unlockCost > 0 && laughPoints >= c.unlockCost,
  );
}
