"use client";

import type { Territory } from "@/types/storm";
import { MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";

export function TerritoryGenerator({
  territories,
  selectedIds,
  onToggle,
  onGenerate,
  disabled,
}: {
  territories: Territory[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onGenerate: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--soa-border)] bg-white/80 overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--soa-border)] flex items-center justify-between gap-2">
        <div>
          <h3 className="font-[family-name:var(--font-display)] font-bold text-sm text-[var(--soa-ink)]">
            Territory generator
          </h3>
          <p className="text-xs text-[var(--soa-muted)]">
            Nearby neighborhoods & ZIP codes to canvass
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[var(--soa-teal)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:brightness-110 transition"
        >
          <MapPinned className="h-3.5 w-3.5" />
          Generate
        </button>
      </div>

      {territories.length === 0 ? (
        <p className="p-4 text-xs text-[var(--soa-muted)]">
          Select a storm, then generate recommended canvassing territories.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--soa-border)]">
          {territories.map((t) => {
            const on = selectedIds.includes(t.id);
            return (
              <li key={t.id}>
                <label
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                    on ? "bg-teal-50/80" : "hover:bg-black/[0.02]"
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--soa-teal)]"
                    checked={on}
                    onChange={() => onToggle(t.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--soa-ink)]">
                        {t.neighborhood}
                      </span>
                      <span className="text-xs font-bold text-teal-700 tabular-nums">
                        P{t.priority}
                      </span>
                    </span>
                    <span className="block text-xs text-[var(--soa-muted)] mt-0.5">
                      ZIP {t.zipCode} · {t.estimatedHomes} homes · {t.distanceMiles} mi
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
