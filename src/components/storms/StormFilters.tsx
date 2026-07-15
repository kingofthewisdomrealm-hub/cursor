"use client";

import { cn } from "@/lib/utils";
import type { TimeFilter } from "@/types/storm";

const FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "24h", label: "24 hours" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

export function StormFilters({
  value,
  onChange,
}: {
  value: TimeFilter;
  onChange: (f: TimeFilter) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Time filter">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          role="tab"
          aria-selected={value === f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all",
            value === f.value
              ? "bg-[var(--soa-teal)] text-white shadow-sm"
              : "bg-white/70 text-[var(--soa-muted)] border border-[var(--soa-border)] hover:text-[var(--soa-ink)]"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
