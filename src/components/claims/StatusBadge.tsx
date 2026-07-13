import type { ClaimStatus } from "@/types/claim";
import { CLAIM_STATUS_LABELS } from "@/types/claim";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<ClaimStatus, string> = {
  new_loss: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  inspection_scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  inspection_complete: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  estimate_received: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  supplementing: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  negotiation: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  settlement: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  closed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        STATUS_COLORS[status]
      )}
    >
      {CLAIM_STATUS_LABELS[status]}
    </span>
  );
}
