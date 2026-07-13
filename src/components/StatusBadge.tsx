import { cn, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        TASK_STATUS_COLORS[status] ?? TASK_STATUS_COLORS.not_started,
        className
      )}
    >
      {TASK_STATUS_LABELS[status] ?? status}
    </span>
  );
}
