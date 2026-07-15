"use client";

import { Radar, Loader2 } from "lucide-react";

export function ScanButton({
  scanning,
  onScan,
  lastScanAt,
}: {
  scanning: boolean;
  onScan: () => void;
  lastScanAt?: string | null;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <button
        type="button"
        onClick={onScan}
        disabled={scanning}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--soa-teal)] px-5 py-3 text-sm font-bold text-white shadow-md shadow-teal-900/10 hover:brightness-110 disabled:opacity-60 transition scan-btn"
      >
        {scanning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Radar className="h-4 w-4" />
        )}
        {scanning ? "Scanning…" : "Run Storm Scan"}
      </button>
      {lastScanAt && (
        <p className="text-xs text-[var(--soa-muted)]">
          Last scan{" "}
          <time dateTime={lastScanAt}>
            {new Date(lastScanAt).toLocaleString()}
          </time>
        </p>
      )}
    </div>
  );
}
