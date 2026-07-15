import { scoreStorms } from "@/lib/scoring";
import type { ScoredStorm, StormReport } from "@/types/storm";

export function topFloridaOpportunities(
  storms: StormReport[],
  limit = 5
): ScoredStorm[] {
  return scoreStorms(storms).slice(0, limit);
}

export function formatDailyReport(storms: StormReport[]): {
  generatedAt: string;
  top: ScoredStorm[];
  summary: string;
} {
  const top = topFloridaOpportunities(storms, 5);
  const avg =
    top.length === 0
      ? 0
      : Math.round(top.reduce((s, t) => s + t.opportunityScore, 0) / top.length);

  return {
    generatedAt: new Date().toISOString(),
    top,
    summary: top.length
      ? `Top ${top.length} Florida storm opportunities (avg score ${avg}). Lead: ${top[0].city} ${top[0].type} — score ${top[0].opportunityScore}.`
      : "No storm opportunities in the current window.",
  };
}
