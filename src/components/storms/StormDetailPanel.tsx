"use client";

import type { ScoredStorm } from "@/types/storm";
import { formatStormType, formatConfidence } from "@/lib/utils";
import { OpportunityScore } from "./OpportunityScore";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-[var(--soa-border)]/70 last:border-0">
      <dt className="text-xs text-[var(--soa-muted)] shrink-0">{label}</dt>
      <dd className="text-xs font-medium text-[var(--soa-ink)] text-right">{value}</dd>
    </div>
  );
}

export function StormDetailPanel({ storm }: { storm: ScoredStorm | null }) {
  if (!storm) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--soa-border)] bg-white/50 p-6 text-center text-sm text-[var(--soa-muted)]">
        Select a storm on the map or list to review details and Opportunity Score.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--soa-border)] bg-white/80 backdrop-blur-sm overflow-hidden soa-panel-enter">
      <div className="px-4 py-3 border-b border-[var(--soa-border)] bg-[var(--soa-mist)]/80">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-[var(--soa-ink)]">
          {storm.city}, FL
        </h2>
        <p className="text-xs text-[var(--soa-muted)] mt-0.5">{storm.description}</p>
      </div>

      <div className="p-4">
        <OpportunityScore storm={storm} />
      </div>

      <dl className="px-4 pb-4">
        <Row label="Storm type" value={formatStormType(storm.type)} />
        <Row label="Date" value={storm.date} />
        <Row label="Time" value={storm.time} />
        <Row label="City" value={storm.city} />
        <Row label="ZIP code" value={storm.zipCode} />
        <Row
          label="Wind speed"
          value={storm.windSpeedMph != null ? `${storm.windSpeedMph} mph` : "—"}
        />
        <Row
          label="Hail size"
          value={
            storm.hailSizeInches != null ? `${storm.hailSizeInches}"` : "—"
          }
        />
        <Row
          label="Coordinates"
          value={`${storm.lat.toFixed(4)}, ${storm.lng.toFixed(4)}`}
        />
        <Row label="Source" value={storm.source} />
        <Row label="Confidence" value={formatConfidence(storm.confidence)} />
        <Row label="Reports" value={storm.reportCount} />
        <Row label="County" value={storm.county} />
      </dl>
    </div>
  );
}
