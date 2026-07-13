export interface ChallengeDefinition {
  id: string
  title: string
  instruction: string
  target: number
  reward: number
  statKey: 'totalMerges' | 'sharpnessMerges' | 'learningChallengesCompleted' | 'crossMerges' | 'points' | 'hasStrategist' | 'hasCatalyst' | 'hasLegendary'
}

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'sharpness_merges',
    title: 'Sharp Mind',
    instruction: 'Complete three Sharpness path merges.',
    target: 3,
    reward: 75,
    statKey: 'sharpnessMerges',
  },
  {
    id: 'create_strategist',
    title: 'Strategic Thinker',
    instruction: 'Create one Strategist tile.',
    target: 1,
    reward: 100,
    statKey: 'hasStrategist',
  },
  {
    id: 'total_merges',
    title: 'Merge Master',
    instruction: 'Complete five total merges.',
    target: 5,
    reward: 50,
    statKey: 'totalMerges',
  },
  {
    id: 'discover_catalyst',
    title: 'Spark of Energy',
    instruction: 'Discover a Catalyst tile.',
    target: 1,
    reward: 150,
    statKey: 'hasCatalyst',
  },
  {
    id: 'first_cross_merge',
    title: 'Archetype Awakening',
    instruction: 'Create your first cross-merge archetype.',
    target: 1,
    reward: 200,
    statKey: 'crossMerges',
  },
  {
    id: 'earn_500_points',
    title: 'Growing Influence',
    instruction: 'Earn 500 Communication Points.',
    target: 500,
    reward: 100,
    statKey: 'points',
  },
  {
    id: 'learning_challenges',
    title: 'Active Learner',
    instruction: 'Complete three learning card challenges.',
    target: 3,
    reward: 150,
    statKey: 'learningChallengesCompleted',
  },
  {
    id: 'legendary_communicator',
    title: 'Ultimate Ascension',
    instruction: 'Create the Legendary Communicator.',
    target: 1,
    reward: 500,
    statKey: 'hasLegendary',
  },
]
