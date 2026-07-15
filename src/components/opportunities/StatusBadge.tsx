"use client";

import type { OpportunityStatus } from "@/types/storm";
import { cn } from "@/lib/utils";
import { OPPORTUNITY_STATUSES } from "@/lib/opportunity-store";

const TONE: Record<OpportunityStatus, string> = {
  new: "bg-sky-100 text-sky-800",
  researching: "bg-amber-100 text-amber-800",
  ready_to_canvass: "bg-teal-100 text-teal-800",
  currently_canvassing: "bg-violet-100 text-violet-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-slate-200 text-slate-600",
};

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  const label =
    OPPORTUNITY_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        TONE[status]
      )}
    >
      {label}
    </span>
  );
}
