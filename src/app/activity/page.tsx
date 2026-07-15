"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ActivityLog } from "@/components/activity/ActivityLog";
import {
  listActivity,
  getActivitySummary,
  getLastScan,
} from "@/lib/activity-store";
import type { AgentActivityEntry } from "@/types/storm";

export default function ActivityPage() {
  const [entries, setEntries] = useState<AgentActivityEntry[]>([]);
  const [summary, setSummary] = useState(getActivitySummary([]));

  useEffect(() => {
    const activity = listActivity();
    setEntries(activity);
    const s = getActivitySummary(activity);
    const last = getLastScan();
    setSummary({ ...s, lastScanAt: last?.scannedAt ?? s.lastScanAt });
  }, []);

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--soa-ink)]">
          Agent activity log
        </h1>
        <p className="text-sm text-[var(--soa-muted)] mt-1">
          Websites checked, reports found, opportunities created, and errors
        </p>
      </div>
      <ActivityLog entries={entries} summary={summary} />
    </AppShell>
  );
}
