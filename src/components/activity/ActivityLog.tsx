"use client";

import type { AgentActivityEntry } from "@/types/storm";
import { cn } from "@/lib/utils";

const TYPE_STYLE: Record<AgentActivityEntry["type"], string> = {
  scan_start: "bg-sky-100 text-sky-800",
  website_checked: "bg-slate-100 text-slate-700",
  report_found: "bg-teal-100 text-teal-800",
  opportunity_created: "bg-amber-100 text-amber-800",
  error: "bg-rose-100 text-rose-800",
  scan_complete: "bg-emerald-100 text-emerald-800",
};

export function ActivityLog({
  entries,
  summary,
}: {
  entries: AgentActivityEntry[];
  summary: {
    websitesChecked: number;
    reportsFound: number;
    opportunitiesCreated: number;
    errors: number;
    lastScanAt: string | null;
  };
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Websites checked", value: summary.websitesChecked },
          { label: "Reports found", value: summary.reportsFound },
          { label: "Opportunities", value: summary.opportunitiesCreated },
          { label: "Errors", value: summary.errors },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--soa-border)] bg-white/80 px-3 py-3"
          >
            <p className="text-[10px] uppercase tracking-wide text-[var(--soa-muted)] font-semibold">
              {s.label}
            </p>
            <p className="text-2xl font-bold tabular-nums text-[var(--soa-ink)] mt-1">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--soa-muted)]">
        Most recent scan:{" "}
        {summary.lastScanAt
          ? new Date(summary.lastScanAt).toLocaleString()
          : "Not yet run — use Run Storm Scan"}
      </p>

      <ul className="rounded-xl border border-[var(--soa-border)] bg-white/80 divide-y divide-[var(--soa-border)] max-h-[520px] overflow-y-auto">
        {entries.length === 0 ? (
          <li className="p-6 text-sm text-[var(--soa-muted)] text-center">
            Activity will appear after you run a storm scan.
          </li>
        ) : (
          entries.map((e) => (
            <li key={e.id} className="px-4 py-3 flex gap-3">
              <span
                className={cn(
                  "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  TYPE_STYLE[e.type]
                )}
              >
                {e.type.replace(/_/g, " ")}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-[var(--soa-ink)]">{e.message}</p>
                <p className="text-[11px] text-[var(--soa-muted)] mt-0.5">
                  {new Date(e.timestamp).toLocaleString()}
                  {e.source ? ` · ${e.source}` : ""}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
