"use client";

import dynamic from "next/dynamic";
import type { ScoredStorm, Territory } from "@/types/storm";

const StormMapInner = dynamic(
  () => import("./StormMap").then((m) => m.StormMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[280px] w-full rounded-xl border border-[var(--soa-border)] bg-[var(--soa-mist)] flex items-center justify-center text-sm text-[var(--soa-muted)]">
        Loading Florida map…
      </div>
    ),
  }
);

export function StormMapClient(props: {
  storms: ScoredStorm[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  territories?: Territory[];
}) {
  return <StormMapInner {...props} />;
}
