"use client";

import type { SavedOpportunity, OpportunityStatus } from "@/types/storm";
import { StatusBadge } from "./StatusBadge";
import { OPPORTUNITY_STATUSES } from "@/lib/opportunity-store";
import { formatStormType } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export function OpportunityList({
  items,
  onStatusChange,
}: {
  items: SavedOpportunity[];
  onStatusChange: (id: string, status: OpportunityStatus) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--soa-border)] p-10 text-center text-sm text-[var(--soa-muted)]">
        No saved opportunities yet. Scan storms, generate a territory, and save.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((o) => (
        <article
          key={o.id}
          className="rounded-xl border border-[var(--soa-border)] bg-white/80 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-[family-name:var(--font-display)] font-bold text-[var(--soa-ink)]">
                  {o.storm.city} · {formatStormType(o.storm.type)}
                </h3>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-xs text-[var(--soa-muted)] mt-1">
                Score {o.storm.opportunityScore} · ZIP {o.storm.zipCode} ·{" "}
                {o.storm.date} {o.storm.time} · {o.territories.length} territories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-wide text-[var(--soa-muted)] font-semibold">
                Status
              </label>
              <select
                value={o.status}
                onChange={(e) =>
                  onStatusChange(o.id, e.target.value as OpportunityStatus)
                }
                className="rounded-lg border border-[var(--soa-border)] bg-white px-2 py-1.5 text-xs font-medium"
              >
                {OPPORTUNITY_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {o.routeUrl && (
            <a
              href={o.routeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
            >
              Open route <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
