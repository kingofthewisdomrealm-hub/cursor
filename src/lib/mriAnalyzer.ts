import type {
  ContradictionItem,
  ConversationMRI,
  DimensionScore,
  EmotionalState,
  InsightItem,
  InternalWorld,
  MRIDimension,
  NavigationArea,
  NavigationPlan,
  OpportunityItem,
  PatternItem,
  RecommendedQuestion,
} from '../types/mri'
import {
  extractSentences,
  getClientText,
  identifyClientSpeaker,
  parseTranscript,
  type TranscriptSegment,
} from './transcriptParser'

const GOAL_PATTERNS = [
  /\b(i want|i'd like|my goal|i hope|i dream|i need to|i'm trying to|i wish)\b/i,
  /\b(achieve|accomplish|become|build|create|grow|improve|reach)\b/i,
]

const FEAR_PATTERNS = [
  /\b(afraid|scared|worried|anxious|nervous|fear|terrified|dread)\b/i,
  /\b(what if|might fail|could lose|don't want to|can't afford to)\b/i,
]

const VALUE_PATTERNS = [
  /\b(important to me|matters|i value|i believe in|i care about|principle|integrity)\b/i,
  /\b(family|freedom|honesty|growth|security|creativity|impact|balance)\b/i,
]

const BELIEF_PATTERNS = [
  /\b(i can't|i'm not|i'll never|i always|too (old|young|late)|not good enough)\b/i,
  /\b(no one|everyone|always fails|never works|impossible for me)\b/i,
]

const EMOTION_LEXICON: Record<string, { valence: EmotionalState['valence']; weight: number }> = {
  excited: { valence: 'positive', weight: 0.7 },
  hopeful: { valence: 'positive', weight: 0.6 },
  grateful: { valence: 'positive', weight: 0.6 },
  proud: { valence: 'positive', weight: 0.7 },
  frustrated: { valence: 'negative', weight: 0.7 },
  angry: { valence: 'negative', weight: 0.8 },
  sad: { valence: 'negative', weight: 0.7 },
  overwhelmed: { valence: 'negative', weight: 0.8 },
  stuck: { valence: 'negative', weight: 0.75 },
  confused: { valence: 'mixed', weight: 0.6 },
  uncertain: { valence: 'mixed', weight: 0.55 },
  conflicted: { valence: 'mixed', weight: 0.7 },
}

const DIMENSION_LABELS: Record<MRIDimension, string> = {
  clarity: 'Goal Clarity',
  emotionalOpenness: 'Emotional Openness',
  motivation: 'Motivation',
  selfAwareness: 'Self-Awareness',
  resistance: 'Resistance',
  trust: 'Trust & Safety',
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text))
}

function findMatches(
  sentences: string[],
  segments: TranscriptSegment[],
  clientSpeaker: string,
  patterns: RegExp[],
): { sentence: string; speaker?: string }[] {
  const results: { sentence: string; speaker?: string }[] = []

  for (const sentence of sentences) {
    if (matchesAny(sentence, patterns)) {
      results.push({ sentence })
    }
  }

  for (const segment of segments.filter((s) => s.speaker === clientSpeaker)) {
    const sents = extractSentences(segment.text)
    for (const sentence of sents) {
      if (matchesAny(sentence, patterns)) {
        results.push({ sentence, speaker: segment.speaker })
      }
    }
  }

  const seen = new Set<string>()
  return results.filter((r) => {
    const key = r.sentence.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function toInsight(
  prefix: string,
  label: string,
  matches: { sentence: string; speaker?: string }[],
  descriptionFn: (sentence: string) => string,
): InsightItem | null {
  if (matches.length === 0) return null
  const primary = matches[0].sentence
  return {
    id: uid(prefix),
    label,
    description: descriptionFn(primary),
    intensity: Math.min(1, 0.4 + matches.length * 0.15),
    evidence: matches.slice(0, 3).map((m) => ({ text: m.sentence, speaker: m.speaker })),
  }
}

function extractGoals(
  sentences: string[],
  segments: TranscriptSegment[],
  clientSpeaker: string,
): InsightItem[] {
  const matches = findMatches(sentences, segments, clientSpeaker, GOAL_PATTERNS)
  const items: InsightItem[] = []

  const aspiration = toInsight('goal', 'Aspiration', matches, (s) =>
    `Expressed desire or direction: "${truncate(s, 80)}"`,
  )
  if (aspiration) items.push(aspiration)

  const growth = matches.filter((m) => /\b(grow|improve|learn|develop|build)\b/i.test(m.sentence))
  const growthItem = toInsight('goal-g', 'Growth Direction', growth, (s) =>
    `Focus on development and progress: "${truncate(s, 80)}"`,
  )
  if (growthItem) items.push(growthItem)

  return items
}

function extractFears(
  sentences: string[],
  segments: TranscriptSegment[],
  clientSpeaker: string,
): InsightItem[] {
  const matches = findMatches(sentences, segments, clientSpeaker, FEAR_PATTERNS)
  const items: InsightItem[] = []

  const fear = toInsight('fear', 'Underlying Fear', matches, (s) =>
    `Anxiety or concern surfaced: "${truncate(s, 80)}"`,
  )
  if (fear) items.push(fear)

  const avoidance = matches.filter((m) => /\b(avoid|don't want|can't|won't)\b/i.test(m.sentence))
  const avoidItem = toInsight('fear-a', 'Avoidance Pattern', avoidance, (s) =>
    `Protective avoidance detected: "${truncate(s, 80)}"`,
  )
  if (avoidItem) items.push(avoidItem)

  return items
}

function extractValues(
  sentences: string[],
  segments: TranscriptSegment[],
  clientSpeaker: string,
): InsightItem[] {
  const matches = findMatches(sentences, segments, clientSpeaker, VALUE_PATTERNS)
  const items: InsightItem[] = []

  for (const match of matches.slice(0, 4)) {
    const valueWord = match.sentence.match(
      /\b(family|freedom|honesty|growth|security|creativity|impact|balance|integrity|trust|respect)\b/i,
    )
    items.push({
      id: uid('value'),
      label: valueWord ? capitalize(valueWord[1]) : 'Core Value',
      description: `Value signal in language: "${truncate(match.sentence, 80)}"`,
      intensity: 0.65,
      evidence: [{ text: match.sentence, speaker: match.speaker }],
    })
  }

  return items
}

function extractBeliefs(
  sentences: string[],
  segments: TranscriptSegment[],
  clientSpeaker: string,
): InsightItem[] {
  const matches = findMatches(sentences, segments, clientSpeaker, BELIEF_PATTERNS)
  return matches.slice(0, 4).map((m, i) => ({
    id: uid(`belief-${i}`),
    label: 'Limiting Belief',
    description: `Self-imposed constraint: "${truncate(m.sentence, 80)}"`,
    intensity: 0.75,
    evidence: [{ text: m.sentence, speaker: m.speaker }],
  }))
}

function extractEmotions(
  sentences: string[],
  segments: TranscriptSegment[],
  clientSpeaker: string,
): EmotionalState[] {
  const emotions: EmotionalState[] = []
  const allText = [...sentences, ...segments.filter((s) => s.speaker === clientSpeaker).map((s) => s.text)]

  for (const [emotion, meta] of Object.entries(EMOTION_LEXICON)) {
    const evidence: EmotionalState['evidence'] = []
    for (const text of allText) {
      if (new RegExp(`\\b${emotion}\\b`, 'i').test(text)) {
        const sents = extractSentences(text)
        for (const s of sents) {
          if (new RegExp(`\\b${emotion}\\b`, 'i').test(s)) {
            evidence.push({ text: s })
          }
        }
      }
    }
    if (evidence.length > 0) {
      emotions.push({
        emotion: capitalize(emotion),
        intensity: Math.min(1, meta.weight + evidence.length * 0.1),
        valence: meta.valence,
        evidence: evidence.slice(0, 2),
      })
    }
  }

  if (emotions.length === 0 && sentences.length > 0) {
    emotions.push({
      emotion: 'Reflective',
      intensity: 0.5,
      valence: 'neutral',
      evidence: [{ text: sentences[0] }],
    })
  }

  return emotions.sort((a, b) => b.intensity - a.intensity).slice(0, 5)
}

function extractPatterns(sentences: string[]): PatternItem[] {
  const wordFreq = new Map<string, number>()
  const bigramFreq = new Map<string, number>()

  for (const sentence of sentences) {
    const words = sentence.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []
    for (const word of words) {
      if (!STOP_WORDS.has(word)) wordFreq.set(word, (wordFreq.get(word) ?? 0) + 1)
    }
    for (let i = 0; i < words.length - 1; i++) {
      if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
        const bg = `${words[i]} ${words[i + 1]}`
        bigramFreq.set(bg, (bigramFreq.get(bg) ?? 0) + 1)
      }
    }
  }

  const patterns: PatternItem[] = []

  for (const [phrase, count] of [...bigramFreq.entries()].filter(([, c]) => c >= 2).slice(0, 3)) {
    const evidence = sentences.filter((s) => s.toLowerCase().includes(phrase)).slice(0, 2)
    patterns.push({
      id: uid('pattern'),
      name: `Recurring: "${phrase}"`,
      description: `This phrase appears ${count} times, suggesting a recurring mental loop or theme.`,
      frequency: count,
      evidence: evidence.map((text) => ({ text })),
    })
  }

  const topWord = [...wordFreq.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topWord && topWord[1] >= 3) {
    patterns.push({
      id: uid('pattern-w'),
      name: `Theme: "${topWord[0]}"`,
      description: `The word "${topWord[0]}" appears frequently (${topWord[1]}x), indicating a dominant concern or focus area.`,
      frequency: topWord[1],
      evidence: sentences.filter((s) => s.toLowerCase().includes(topWord[0])).slice(0, 2).map((text) => ({ text })),
    })
  }

  return patterns
}

function extractContradictions(
  goals: InsightItem[],
  fears: InsightItem[],
  beliefs: InsightItem[],
): ContradictionItem[] {
  const items: ContradictionItem[] = []

  if (goals.length > 0 && fears.length > 0) {
    items.push({
      id: uid('contra'),
      statementA: goals[0].evidence[0]?.text ?? goals[0].label,
      statementB: fears[0].evidence[0]?.text ?? fears[0].label,
      tension: 'Desire vs. fear — they want movement but something is holding them back.',
      evidence: [...goals[0].evidence, ...fears[0].evidence].slice(0, 2),
    })
  }

  if (beliefs.length >= 2) {
    items.push({
      id: uid('contra-b'),
      statementA: beliefs[0].evidence[0]?.text ?? '',
      statementB: beliefs[1].evidence[0]?.text ?? '',
      tension: 'Competing self-narratives may be creating internal paralysis.',
      evidence: [...beliefs[0].evidence, ...beliefs[1].evidence].slice(0, 2),
    })
  }

  return items
}

function extractOpportunities(
  goals: InsightItem[],
  fears: InsightItem[],
  contradictions: ContradictionItem[],
  emotions: EmotionalState[],
): OpportunityItem[] {
  const items: OpportunityItem[] = []

  if (contradictions.length > 0) {
    items.push({
      id: uid('opp'),
      area: 'Contradiction Bridge',
      description: 'The tension between opposing statements is where breakthrough insight typically emerges. Explore both sides without forcing resolution.',
      leverage: 'high',
    })
  }

  if (fears.length > 0) {
    items.push({
      id: uid('opp-f'),
      area: 'Fear Exploration',
      description: 'Named fears are doorways — the person has already brought them into awareness, which means they are ready to be explored safely.',
      leverage: 'high',
    })
  }

  const negativeEmotion = emotions.find((e) => e.valence === 'negative')
  if (negativeEmotion) {
    items.push({
      id: uid('opp-e'),
      area: 'Emotional Processing',
      description: `${negativeEmotion.emotion} is present and accessible. Validating this emotion can unlock deeper honesty.`,
      leverage: 'medium',
    })
  }

  if (goals.length > 0) {
    items.push({
      id: uid('opp-g'),
      area: 'Vision Amplification',
      description: 'Their stated aspirations can be used as a north star to reframe fears and limiting beliefs.',
      leverage: 'medium',
    })
  }

  return items
}

function computeDimensions(
  goals: InsightItem[],
  fears: InsightItem[],
  beliefs: InsightItem[],
  emotions: EmotionalState[],
  wordCount: number,
): DimensionScore[] {
  const clarity = clamp(0.3 + goals.length * 0.2 + (wordCount > 200 ? 0.15 : 0))
  const emotionalOpenness = clamp(
    0.25 + emotions.length * 0.12 + emotions.filter((e) => e.valence !== 'neutral').length * 0.1,
  )
  const motivation = clamp(0.35 + goals.length * 0.18 - fears.length * 0.05)
  const selfAwareness = clamp(0.3 + beliefs.length * 0.15 + emotions.length * 0.08)
  const resistance = clamp(0.2 + fears.length * 0.2 + beliefs.length * 0.15)
  const trust = clamp(0.4 + emotionalOpenness * 0.3 + (wordCount > 150 ? 0.15 : 0))

  const scores: Record<MRIDimension, number> = {
    clarity,
    emotionalOpenness,
    motivation,
    selfAwareness,
    resistance,
    trust,
  }

  const interpretations: Record<MRIDimension, (s: number) => string> = {
    clarity: (s) =>
      s > 0.7 ? 'Goals are articulated with reasonable specificity.' : 'Goals may still be forming — help them sharpen the picture.',
    emotionalOpenness: (s) =>
      s > 0.65 ? 'Willing to name feelings and vulnerabilities.' : 'Emotions may be guarded — build safety before probing deeper.',
    motivation: (s) =>
      s > 0.65 ? 'Forward energy is present despite obstacles.' : 'Motivation may be fragile — connect actions to values.',
    selfAwareness: (s) =>
      s > 0.6 ? 'Shows reflective capacity and pattern recognition.' : 'Limited self-reflection detected — use mirroring questions.',
    resistance: (s) =>
      s > 0.65 ? 'Significant internal blocks — pace carefully, don\'t push.' : 'Lower resistance — good window for direct exploration.',
    trust: (s) =>
      s > 0.65 ? 'Rapport foundation appears solid.' : 'Trust may need strengthening before challenging work.',
  }

  return (Object.keys(scores) as MRIDimension[]).map((dimension) => ({
    dimension,
    label: DIMENSION_LABELS[dimension],
    score: scores[dimension],
    interpretation: interpretations[dimension](scores[dimension]),
  }))
}

function buildNavigation(
  dimensions: DimensionScore[],
  internalWorld: InternalWorld,
): NavigationPlan {
  const resistance = dimensions.find((d) => d.dimension === 'resistance')?.score ?? 0.5
  const clarity = dimensions.find((d) => d.dimension === 'clarity')?.score ?? 0.5
  const trust = dimensions.find((d) => d.dimension === 'trust')?.score ?? 0.5

  const priorityAreas: NavigationArea[] = []

  if (internalWorld.contradictions.length > 0) {
    priorityAreas.push({
      dimension: 'Contradictions',
      priority: 'critical',
      approach: 'Hold both truths without resolving prematurely. Ask what each side is protecting.',
      avoid: 'Rushing to pick a side or "fix" the tension.',
    })
  }

  if (internalWorld.fears.length > 0) {
    priorityAreas.push({
      dimension: 'Fears',
      priority: resistance > 0.6 ? 'high' : 'medium',
      approach: 'Normalize the fear, then explore its origin and what it\'s trying to protect.',
      avoid: 'Dismissing fears as irrational or jumping to solutions.',
    })
  }

  if (internalWorld.limitingBeliefs.length > 0) {
    priorityAreas.push({
      dimension: 'Limiting Beliefs',
      priority: 'high',
      approach: 'Gently challenge with evidence from their own story. Ask "What if the opposite were true?"',
      avoid: 'Direct confrontation before trust is established.',
    })
  }

  if (clarity < 0.55) {
    priorityAreas.push({
      dimension: 'Goal Clarity',
      priority: 'medium',
      approach: 'Use future-pacing and specificity questions to crystallize what success looks like.',
      avoid: 'Assuming you know what they want.',
    })
  }

  if (trust < 0.55) {
    priorityAreas.push({
      dimension: 'Trust Building',
      priority: 'critical',
      approach: 'Reflect back what you hear. Validate before challenging. Match their pace.',
      avoid: 'Deep probing or interpretive leaps too early.',
    })
  }

  const breakthroughLevers = internalWorld.opportunities
    .filter((o) => o.leverage === 'high')
    .map((o) => o.area)

  if (breakthroughLevers.length === 0 && internalWorld.goals.length > 0) {
    breakthroughLevers.push('Vision Amplification')
  }

  let overallStrategy: string
  if (resistance > 0.65) {
    overallStrategy = 'Safety-first navigation — build trust, validate emotions, then gently surface contradictions.'
  } else if (clarity > 0.65 && internalWorld.contradictions.length > 0) {
    overallStrategy = 'Insight acceleration — they have clarity but internal conflict. Focus on contradiction bridging.'
  } else if (clarity < 0.5) {
    overallStrategy = 'Discovery mode — help them articulate what they truly want before addressing blocks.'
  } else {
    overallStrategy = 'Balanced exploration — alternate between vision-building and obstacle-mapping.'
  }

  const cautions: string[] = []
  if (resistance > 0.6) cautions.push('High resistance detected — pushing too fast may cause shutdown.')
  if (trust < 0.5) cautions.push('Trust appears fragile — prioritize rapport over progress.')
  if (internalWorld.emotions.some((e) => e.valence === 'negative' && e.intensity > 0.7)) {
    cautions.push('Strong negative emotions present — ensure adequate space for processing.')
  }
  if (cautions.length === 0) cautions.push('No major red flags — maintain curiosity and follow their energy.')

  return {
    overallStrategy,
    summary: `Navigate toward ${breakthroughLevers[0] ?? 'deeper self-understanding'} by honoring their ${internalWorld.values[0]?.label ?? 'stated values'} while addressing ${internalWorld.fears[0]?.label ?? 'underlying concerns'}.`,
    priorityAreas,
    cautions,
    breakthroughLevers,
    recommendedApproach:
      trust < 0.55
        ? 'Start with reflection and validation. Mirror their language. Only challenge after they feel heard.'
        : 'Use their own words as anchors. Link fears to values, then invite them to imagine life beyond the limitation.',
  }
}

function buildQuestions(internalWorld: InternalWorld): RecommendedQuestion[] {
  const questions: RecommendedQuestion[] = []

  if (internalWorld.contradictions.length > 0) {
    const c = internalWorld.contradictions[0]
    questions.push({
      id: uid('q'),
      question: 'What would it mean if both of these things could be true at the same time?',
      rationale: `Bridges the tension between "${truncate(c.statementA, 40)}" and "${truncate(c.statementB, 40)}" without forcing a choice.`,
      targetArea: 'Contradictions',
      timing: 'now',
    })
  }

  if (internalWorld.fears.length > 0) {
    questions.push({
      id: uid('q'),
      question: 'If this fear had a voice, what would it be trying to protect you from?',
      rationale: 'Reframes fear as protective rather than pathological, opening compassionate exploration.',
      targetArea: 'Fears',
      timing: internalWorld.contradictions.length > 0 ? 'next' : 'now',
    })
  }

  if (internalWorld.limitingBeliefs.length > 0) {
    const belief = internalWorld.limitingBeliefs[0].evidence[0]?.text ?? ''
    questions.push({
      id: uid('q'),
      question: 'When did you first start believing that? What was happening in your life then?',
      rationale: `Traces the origin of "${truncate(belief, 50)}" to separate past context from present reality.`,
      targetArea: 'Limiting Beliefs',
      timing: 'next',
    })
  }

  if (internalWorld.goals.length > 0) {
    questions.push({
      id: uid('q'),
      question: 'If you woke up tomorrow and this was fully resolved, what would be the first thing you\'d notice?',
      rationale: 'Future-pacing question that makes abstract goals concrete and emotionally resonant.',
      targetArea: 'Goals',
      timing: 'later',
    })
  }

  if (internalWorld.values.length > 0) {
    questions.push({
      id: uid('q'),
      question: `How does ${internalWorld.values[0].label.toLowerCase()} show up in the decisions you're facing right now?`,
      rationale: 'Connects stated values to current dilemma, creating alignment-based motivation.',
      targetArea: 'Values',
      timing: 'later',
    })
  }

  if (questions.length < 3) {
    questions.push({
      id: uid('q'),
      question: 'What part of this conversation feels most alive or charged for you right now?',
      rationale: 'Follows emotional energy — often the fastest path to breakthrough material.',
      targetArea: 'General',
      timing: 'now',
    })
  }

  return questions.slice(0, 5)
}

const STOP_WORDS = new Set([
  'that', 'this', 'with', 'from', 'have', 'been', 'were', 'they', 'what', 'when',
  'just', 'like', 'about', 'would', 'could', 'should', 'really', 'think', 'know',
  'something', 'because', 'there', 'their', 'them', 'then', 'than', 'some', 'into',
])

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max)}…`
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function clamp(n: number): number {
  return Math.max(0.15, Math.min(0.95, n))
}

export async function analyzeTranscript(
  rawTranscript: string,
  participantName?: string,
): Promise<ConversationMRI> {
  await new Promise((r) => setTimeout(r, 1800))

  const segments = parseTranscript(rawTranscript)
  const clientSpeaker = participantName?.trim() || identifyClientSpeaker(segments)
  const clientText = getClientText(segments, clientSpeaker)
  const sentences = extractSentences(clientText)
  const wordCount = clientText.split(/\s+/).filter(Boolean).length

  const goals = extractGoals(sentences, segments, clientSpeaker)
  const fears = extractFears(sentences, segments, clientSpeaker)
  const values = extractValues(sentences, segments, clientSpeaker)
  const limitingBeliefs = extractBeliefs(sentences, segments, clientSpeaker)
  const emotions = extractEmotions(sentences, segments, clientSpeaker)
  const patterns = extractPatterns(sentences)
  const contradictions = extractContradictions(goals, fears, limitingBeliefs)
  const opportunities = extractOpportunities(goals, fears, contradictions, emotions)

  const internalWorld: InternalWorld = {
    goals,
    fears,
    values,
    emotions,
    limitingBeliefs,
    patterns,
    contradictions,
    opportunities,
  }

  const dimensions = computeDimensions(goals, fears, limitingBeliefs, emotions, wordCount)
  const navigation = buildNavigation(dimensions, internalWorld)
  const questions = buildQuestions(internalWorld)

  return {
    id: uid('mri'),
    participantName: clientSpeaker,
    analyzedAt: new Date().toISOString(),
    wordCount,
    dimensions,
    internalWorld,
    navigation,
    questions,
  }
}

export const SAMPLE_TRANSCRIPT = `Coach: What's been on your mind lately?

Client: I've been thinking a lot about my career. I want to make a bigger impact, but I'm afraid of leaving the security I have now. I've been at this company for eight years.

Coach: What does "bigger impact" mean to you?

Client: I care about mentoring younger people. I believe in growth and creativity. But I keep telling myself I'm not leadership material. Everyone else seems more confident.

Coach: That sounds frustrating. How does that feel?

Client: Honestly, I feel stuck. Part of me is excited about the possibility of change, but I'm overwhelmed by what I might lose. My family depends on this income, and I worry about failing.

Coach: What would success look like if fear wasn't a factor?

Client: I'd build something of my own — maybe a coaching practice. I dream about helping people the way you've helped me. But what if I'm too old to start over? I always seem to find reasons not to act.

Coach: You mentioned feeling excited and overwhelmed in the same breath.

Client: Yeah, that's the contradiction. I want freedom, but I'm scared of the unknown. It's important to me that I don't let my team down either.`
