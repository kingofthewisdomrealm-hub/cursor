export type AppStep = 'input' | 'analyzing' | 'results'

export type MRIDimension =
  | 'clarity'
  | 'emotionalOpenness'
  | 'motivation'
  | 'selfAwareness'
  | 'resistance'
  | 'trust'

export interface EvidenceQuote {
  text: string
  speaker?: string
}

export interface InsightItem {
  id: string
  label: string
  description: string
  intensity: number
  evidence: EvidenceQuote[]
}

export interface EmotionalState {
  emotion: string
  intensity: number
  valence: 'positive' | 'negative' | 'mixed' | 'neutral'
  evidence: EvidenceQuote[]
}

export interface PatternItem {
  id: string
  name: string
  description: string
  frequency: number
  evidence: EvidenceQuote[]
}

export interface ContradictionItem {
  id: string
  statementA: string
  statementB: string
  tension: string
  evidence: EvidenceQuote[]
}

export interface OpportunityItem {
  id: string
  area: string
  description: string
  leverage: 'high' | 'medium' | 'low'
}

export interface NavigationArea {
  dimension: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  approach: string
  avoid: string
}

export interface RecommendedQuestion {
  id: string
  question: string
  rationale: string
  targetArea: string
  timing: 'now' | 'next' | 'later'
}

export interface DimensionScore {
  dimension: MRIDimension
  label: string
  score: number
  interpretation: string
}

export interface InternalWorld {
  goals: InsightItem[]
  fears: InsightItem[]
  values: InsightItem[]
  emotions: EmotionalState[]
  limitingBeliefs: InsightItem[]
  patterns: PatternItem[]
  contradictions: ContradictionItem[]
  opportunities: OpportunityItem[]
}

export interface NavigationPlan {
  overallStrategy: string
  summary: string
  priorityAreas: NavigationArea[]
  cautions: string[]
  breakthroughLevers: string[]
  recommendedApproach: string
}

export interface ConversationMRI {
  id: string
  participantName: string
  analyzedAt: string
  wordCount: number
  dimensions: DimensionScore[]
  internalWorld: InternalWorld
  navigation: NavigationPlan
  questions: RecommendedQuestion[]
}
