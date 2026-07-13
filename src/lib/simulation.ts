import type { Card, FilledSlots, FitBreakdown, SimulationResult } from '../types/game'
import type { BossBattle } from '../types/game'

function tagOverlap(tagsA: string[], tagsB: string[]): number {
  const setB = new Set(tagsB)
  const matches = tagsA.filter((t) => setB.has(t)).length
  const maxPossible = Math.max(tagsA.length, tagsB.length, 1)
  return (matches / maxPossible) * 100
}

function affinityScore(cardA: Card, cardB: Card): number {
  let score = 0
  for (const tag of cardB.tags) {
    score += cardA.affinities[tag] ?? 0
  }
  for (const tag of cardA.tags) {
    score += cardB.affinities[tag] ?? 0
  }
  return Math.min(score, 50)
}

function pairFit(a: Card | null, b: Card | null): number {
  if (!a || !b) return 0
  const overlap = tagOverlap(a.tags, b.tags)
  const affinity = affinityScore(a, b)
  const strength = (a.strength + b.strength) / 2
  return Math.min(100, overlap * 0.4 + affinity * 0.4 + strength * 0.2)
}

function tripleFit(a: Card | null, b: Card | null, c: Card | null): number {
  if (!a || !b || !c) return 0
  const pairs = [pairFit(a, b), pairFit(a, c), pairFit(b, c)]
  const allTags = [...a.tags, ...b.tags, ...c.tags]
  const uniqueTags = new Set(allTags)
  const coherence = (allTags.length - uniqueTags.size) / allTags.length
  return Math.min(100, pairs.reduce((s, p) => s + p, 0) / 3 + coherence * 20)
}

function calculateBreakdown(slots: FilledSlots): FitBreakdown {
  return {
    productMarket: pairFit(slots.product, slots.market),
    problemMatch: tripleFit(slots.product, slots.market, slots.problem),
    messaging: pairFit(slots.problem, slots.hook),
    offer: pairFit(slots.product, slots.offer),
    traffic: pairFit(slots.market, slots.ad),
    funnel: pairFit(slots.offer, slots.landing),
  }
}

function getActiveWeights(activeSlotCount: number): Partial<FitBreakdown> {
  if (activeSlotCount <= 2) return { productMarket: 1 }
  if (activeSlotCount <= 3) return { productMarket: 0.5, problemMatch: 0.5 }
  if (activeSlotCount <= 4) return { productMarket: 0.25, problemMatch: 0.35, messaging: 0.4 }
  if (activeSlotCount <= 5)
    return { productMarket: 0.15, problemMatch: 0.2, messaging: 0.25, offer: 0.4 }
  if (activeSlotCount <= 6)
    return { productMarket: 0.1, problemMatch: 0.15, messaging: 0.2, offer: 0.2, traffic: 0.35 }
  return {
    productMarket: 0.1,
    problemMatch: 0.12,
    messaging: 0.15,
    offer: 0.18,
    traffic: 0.2,
    funnel: 0.25,
  }
}

function weightedFit(breakdown: FitBreakdown, weights: Partial<FitBreakdown>): number {
  let total = 0
  let weightSum = 0
  for (const key of Object.keys(weights) as (keyof FitBreakdown)[]) {
    const w = weights[key] ?? 0
    total += (breakdown[key] ?? 0) * w
    weightSum += w
  }
  return weightSum > 0 ? total / weightSum : 0
}

function generateFeedback(
  slots: FilledSlots,
  breakdown: FitBreakdown,
  activeCount: number,
): string[] {
  const feedback: string[] = []

  if (activeCount >= 2) {
    if (breakdown.productMarket >= 70) {
      feedback.push(
        `Strong product-market fit! ${slots.product?.name} resonates with ${slots.market?.name}.`,
      )
    } else if (breakdown.productMarket < 40) {
      feedback.push(
        `Poor product-market fit. ${slots.product?.name} doesn't appeal to ${slots.market?.name}. Wrong audience kills conversion.`,
      )
    }
  }

  if (activeCount >= 3 && slots.problem) {
    if (breakdown.problemMatch >= 70) {
      feedback.push(
        `The problem "${slots.problem.name}" is a real pain point this audience faces.`,
      )
    } else if (breakdown.problemMatch < 40) {
      feedback.push(
        `"${slots.problem.name}" doesn't connect with ${slots.product?.name} or ${slots.market?.name}. Mismatched problems confuse buyers.`,
      )
    }
  }

  if (activeCount >= 4 && slots.hook) {
    if (breakdown.messaging >= 70) {
      feedback.push(`Your hook "${slots.hook.name}" directly addresses the customer pain.`)
    } else if (breakdown.messaging < 40) {
      feedback.push(
        `"${slots.hook.name}" misses the mark — it doesn't speak to "${slots.problem?.name}".`,
      )
    }
  }

  if (activeCount >= 5 && slots.offer) {
    if (breakdown.offer >= 70) {
      feedback.push(`"${slots.offer.name}" complements the product and drives action.`)
    } else if (breakdown.offer < 40) {
      feedback.push(`Weak offer fit. "${slots.offer.name}" doesn't match this product type.`)
    }
  }

  if (activeCount >= 6 && slots.ad) {
    if (breakdown.traffic >= 70) {
      feedback.push(`"${slots.ad.name}" reaches ${slots.market?.name} effectively.`)
    } else if (breakdown.traffic < 40) {
      feedback.push(
        `Wrong channel! "${slots.ad.name}" won't reach ${slots.market?.name} where they actually spend time.`,
      )
    }
  }

  if (activeCount >= 7 && slots.landing) {
    if (breakdown.funnel >= 70) {
      feedback.push(`"${slots.landing.name}" completes the funnel — smooth path to purchase.`)
    } else if (breakdown.funnel < 40) {
      feedback.push(
        `Funnel mismatch. "${slots.landing?.name}" doesn't support "${slots.offer?.name}".`,
      )
    }
  }

  if (feedback.length === 0) {
    feedback.push('Decent combination — keep experimenting to find what clicks.')
  }

  return feedback
}

export interface SimulationOptions {
  activeSlots: (keyof FilledSlots)[]
  bossBattle?: BossBattle | null
}

export function runSimulation(
  slots: FilledSlots,
  options: SimulationOptions,
): SimulationResult {
  const { activeSlots, bossBattle } = options
  const activeCount = activeSlots.length
  const breakdown = calculateBreakdown(slots)
  const weights = getActiveWeights(activeCount)
  let overallFit = weightedFit(breakdown, weights)

  // Boss battle modifiers
  let trafficMultiplier = 1
  let conversionPenalty = 0

  if (bossBattle) {
    trafficMultiplier = bossBattle.modifiers.trafficMultiplier ?? 1
    conversionPenalty = bossBattle.modifiers.conversionPenalty ?? 0

    if (bossBattle.modifiers.blockedAdTags && slots.ad) {
      const blocked = bossBattle.modifiers.blockedAdTags
      const adBlocked = slots.ad.tags.some((t) => blocked.includes(t))
      if (adBlocked) {
        overallFit *= 0.3
        trafficMultiplier *= 0.2
      } else {
        overallFit *= 1.15
      }
    }

    if (bossBattle.modifiers.competitorOfferBonus) {
      const offerStrength = breakdown.offer
      if (offerStrength < 60) {
        overallFit *= 0.6
        conversionPenalty += 0.2
      }
    }
  }

  const baseTraffic = 2500 * trafficMultiplier
  const baseConversion = (overallFit / 100) * 0.08
  const conversionRate = Math.max(0.001, baseConversion - conversionPenalty)
  const avgOrderValue = 35 + (slots.product?.strength ?? 50) * 0.5
  const orders = Math.round(baseTraffic * conversionRate)
  const revenue = Math.round(orders * avgOrderValue)
  const costRatio = 0.35 + (100 - overallFit) * 0.003
  const profit = Math.round(revenue * (1 - costRatio))
  const customerSatisfaction = Math.min(99, Math.round(overallFit * 0.85 + (slots.product?.strength ?? 50) * 0.15))
  const repeatCustomers = Math.round(orders * (customerSatisfaction / 100) * 0.3)

  const isSuccess = overallFit >= 55 && conversionRate >= 0.02

  let xpGained = 0
  let xpLost = 0

  if (profit > 0) xpGained += Math.round(profit / 100)
  if (conversionRate >= 0.03) xpGained += Math.round(conversionRate * 500)
  if (customerSatisfaction >= 80) xpGained += 25
  if (repeatCustomers > 10) xpGained += repeatCustomers
  if (overallFit >= 80) xpGained += 50

  if (overallFit < 40) xpLost += 30
  if (breakdown.productMarket < 30) xpLost += 25
  if (breakdown.offer < 30 && activeCount >= 5) xpLost += 15

  const feedback = generateFeedback(slots, breakdown, activeCount)

  if (bossBattle) {
    if (isSuccess) {
      feedback.unshift(`Boss cleared! You survived ${bossBattle.name}.`)
    } else {
      feedback.unshift(`Boss failed! ${bossBattle.challenge}`)
    }
  }

  return {
    revenue,
    profit,
    conversionRate: Math.round(conversionRate * 10000) / 100,
    customerSatisfaction,
    overallFit: Math.round(overallFit),
    breakdown,
    feedback,
    xpGained,
    xpLost,
    isSuccess,
    repeatCustomers,
  }
}
