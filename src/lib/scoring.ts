import type { ScoreBreakdown, ScoredStorm, StormReport } from "@/types/storm";
import { hoursAgo } from "@/lib/utils";

/**
 * Opportunity Score (0–100)
 *
 * Weights:
 * - Storm severity      25%
 * - Storm recency       20%
 * - Number of reports   15%
 * - Residential density 15%
 * - Property age        10%
 * - Data confidence     15%
 */
const WEIGHTS = {
  severity: 0.25,
  recency: 0.2,
  reportVolume: 0.15,
  residentialDensity: 0.15,
  propertyAge: 0.1,
  confidence: 0.15,
} as const;

function recencyScore(report: StormReport): number {
  const hours = hoursAgo(report.date, report.time);
  if (hours <= 24) return 100;
  if (hours <= 72) return 85;
  if (hours <= 168) return 65;
  if (hours <= 720) return 40;
  return 15;
}

function reportVolumeScore(count: number): number {
  if (count >= 20) return 100;
  if (count >= 10) return 85;
  if (count >= 5) return 70;
  if (count >= 2) return 50;
  return 30;
}

function propertyAgeScore(years: number): number {
  // Older roofs / homes → higher restoration opportunity
  if (years >= 25) return 100;
  if (years >= 18) return 85;
  if (years >= 12) return 70;
  if (years >= 7) return 50;
  return 30;
}

export function calculateOpportunityScore(report: StormReport): ScoredStorm {
  const breakdown: ScoreBreakdown = {
    severity: Math.min(100, Math.max(0, report.severity)),
    recency: recencyScore(report),
    reportVolume: reportVolumeScore(report.reportCount),
    residentialDensity: Math.min(100, Math.max(0, report.residentialDensity)),
    propertyAge: propertyAgeScore(report.estimatedPropertyAge),
    confidence: Math.min(100, Math.max(0, report.confidenceScore)),
  };

  const opportunityScore = Math.round(
    breakdown.severity * WEIGHTS.severity +
      breakdown.recency * WEIGHTS.recency +
      breakdown.reportVolume * WEIGHTS.reportVolume +
      breakdown.residentialDensity * WEIGHTS.residentialDensity +
      breakdown.propertyAge * WEIGHTS.propertyAge +
      breakdown.confidence * WEIGHTS.confidence
  );

  return {
    ...report,
    opportunityScore: Math.min(100, Math.max(0, opportunityScore)),
    scoreBreakdown: breakdown,
  };
}

export function scoreStorms(reports: StormReport[]): ScoredStorm[] {
  return reports
    .map(calculateOpportunityScore)
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}
