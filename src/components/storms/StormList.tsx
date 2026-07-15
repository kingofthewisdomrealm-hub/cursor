"use client";

import type { ScoredStorm, StormType } from "@/types/storm";
import { formatStormType } from "@/lib/utils";
import { CloudHail, Wind, Tornado, CloudLightning, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<StormType, typeof Wind> = {
  hail: CloudHail,
  wind: Wind,
  tornado: Tornado,
  severe_thunderstorm: Zap,
  hurricane: CloudLightning,
};

const COLORS: Record<StormType, string> = {
  hail: "bg-amber-500",
  wind: "bg-sky-600",
  tornado: "bg-rose-600",
  severe_thunderstorm: "bg-violet-600",
  hurricane: "bg-teal-700",
};

export function StormList({
  storms,
  selectedId,
  onSelect,
}: {
  storms: ScoredStorm[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (storms.length === 0) {
    return (
      <p className="text-sm text-[var(--soa-muted)] p-4">
        No storms in this window. Run a scan or widen the filter.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--soa-border)] max-h-[320px] lg:max-h-[420px] overflow-y-auto">
      {storms.map((s) => {
        const Icon = ICONS[s.type];
        const active = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "w-full text-left px-3 py-3 flex gap-3 transition-colors",
                active ? "bg-[var(--soa-teal)]/8" : "hover:bg-black/[0.03]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white",
                  COLORS[s.type]
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-[var(--soa-ink)] truncate">
                    {s.city}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      s.opportunityScore >= 75
                        ? "text-teal-700"
                        : s.opportunityScore >= 55
                          ? "text-amber-700"
                          : "text-[var(--soa-muted)]"
                    )}
                  >
                    {s.opportunityScore}
                  </span>
                </span>
                <span className="block text-xs text-[var(--soa-muted)] mt-0.5">
                  {formatStormType(s.type)} · {s.date} {s.time} · {s.zipCode}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
