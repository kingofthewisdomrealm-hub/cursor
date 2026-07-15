"use client";

import type { ScoredStorm } from "@/types/storm";
import { cn } from "@/lib/utils";

export function OpportunityScore({ storm }: { storm: ScoredStorm }) {
  const score = storm.opportunityScore;
  const tone =
    score >= 75 ? "high" : score >= 55 ? "mid" : "low";

  const parts = [
    { key: "Severity", value: storm.scoreBreakdown.severity },
    { key: "Recency", value: storm.scoreBreakdown.recency },
    { key: "Reports", value: storm.scoreBreakdown.reportVolume },
    { key: "Density", value: storm.scoreBreakdown.residentialDensity },
    { key: "Age", value: storm.scoreBreakdown.propertyAge },
    { key: "Confidence", value: storm.scoreBreakdown.confidence },
  ];

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--soa-muted)] font-semibold">
            Opportunity Score
          </p>
          <p
            className={cn(
              "font-[family-name:var(--font-display)] text-4xl font-bold tabular-nums leading-none mt-1 score-pop",
              tone === "high" && "text-teal-700",
              tone === "mid" && "text-amber-700",
              tone === "low" && "text-slate-500"
            )}
          >
            {score}
            <span className="text-base font-semibold text-[var(--soa-muted)]">/100</span>
          </p>
        </div>
        <div className="h-14 w-14 rounded-full border-4 border-[var(--soa-border)] flex items-center justify-center relative">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-[var(--soa-border)]"
            />
            <path
              d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              className={cn(
                tone === "high" && "text-teal-600",
                tone === "mid" && "text-amber-600",
                tone === "low" && "text-slate-400"
              )}
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {parts.map((p) => (
          <div key={p.key} className="rounded-lg bg-[var(--soa-mist)] px-2 py-1.5">
            <p className="text-[10px] text-[var(--soa-muted)]">{p.key}</p>
            <p className="text-sm font-bold tabular-nums text-[var(--soa-ink)]">{p.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
