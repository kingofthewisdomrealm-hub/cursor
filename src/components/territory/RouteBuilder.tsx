"use client";

import { Navigation, Bookmark, Play } from "lucide-react";

export function RouteBuilder({
  selectedCount,
  routeUrl,
  onBuild,
  onSave,
  onBeginCanvass,
  canSave,
}: {
  selectedCount: number;
  routeUrl: string | null;
  onBuild: () => void;
  onSave: () => void;
  onBeginCanvass: () => void;
  canSave: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--soa-border)] bg-white/80 p-4 space-y-3">
      <div>
        <h3 className="font-[family-name:var(--font-display)] font-bold text-sm text-[var(--soa-ink)]">
          Route builder
        </h3>
        <p className="text-xs text-[var(--soa-muted)] mt-0.5">
          {selectedCount} territor{selectedCount === 1 ? "y" : "ies"} selected
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onBuild}
          disabled={selectedCount === 0}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--soa-ink)] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-40 hover:opacity-90 transition"
        >
          <Navigation className="h-3.5 w-3.5" />
          Build route
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--soa-border)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--soa-ink)] disabled:opacity-40 hover:bg-[var(--soa-mist)] transition"
        >
          <Bookmark className="h-3.5 w-3.5" />
          Save opportunity
        </button>
      </div>

      {routeUrl && (
        <a
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--soa-teal)] px-3 py-2.5 text-xs font-semibold text-white hover:brightness-110 transition route-pulse"
        >
          <Navigation className="h-3.5 w-3.5" />
          Open in Google Maps
        </a>
      )}

      <button
        type="button"
        onClick={onBeginCanvass}
        disabled={!canSave}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-700/30 bg-teal-50 px-3 py-2.5 text-xs font-semibold text-teal-800 disabled:opacity-40 hover:bg-teal-100 transition"
      >
        <Play className="h-3.5 w-3.5" />
        Begin canvassing
      </button>
    </div>
  );
}
