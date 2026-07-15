"use client";

import type { ScoredStorm } from "@/types/storm";
import { formatStormType } from "@/lib/utils";

export function DailyReport({
  top,
  summary,
  generatedAt,
}: {
  top: ScoredStorm[];
  summary: string;
  generatedAt: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--soa-border)] bg-white/80 p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--soa-muted)] font-semibold">
          Daily Florida report
        </p>
        <p className="mt-2 text-sm text-[var(--soa-ink)] leading-relaxed">{summary}</p>
        <p className="mt-2 text-xs text-[var(--soa-muted)]">
          Generated {new Date(generatedAt).toLocaleString()}
        </p>
      </div>

      <ol className="space-y-3">
        {top.map((s, i) => (
          <li
            key={s.id}
            className="rounded-xl border border-[var(--soa-border)] bg-white/80 px-4 py-3 flex gap-4 items-center"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--soa-teal)] text-white font-[family-name:var(--font-display)] font-bold">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-[var(--soa-ink)]">
                {s.city} — {formatStormType(s.type)}
              </p>
              <p className="text-xs text-[var(--soa-muted)]">
                {s.date} {s.time} · ZIP {s.zipCode} · {s.county} County
              </p>
            </div>
            <span className="text-lg font-bold tabular-nums text-teal-700">
              {s.opportunityScore}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
