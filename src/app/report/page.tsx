"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DailyReport } from "@/components/report/DailyReport";
import type { ScoredStorm } from "@/types/storm";

export default function ReportPage() {
  const [data, setData] = useState<{
    top: ScoredStorm[];
    summary: string;
    generatedAt: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/report/daily")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--soa-ink)]">
          Daily report
        </h1>
        <p className="text-sm text-[var(--soa-muted)] mt-1">
          Top five storm opportunities in Florida
        </p>
      </div>
      {data ? (
        <DailyReport
          top={data.top}
          summary={data.summary}
          generatedAt={data.generatedAt}
        />
      ) : (
        <p className="text-sm text-[var(--soa-muted)]">Loading report…</p>
      )}
    </AppShell>
  );
}
