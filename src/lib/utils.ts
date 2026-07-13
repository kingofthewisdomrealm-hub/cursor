export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "No deadline set";
  const date = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatProgress(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export const TASK_STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  ready: "Ready",
  in_progress: "In Progress",
  waiting_for_approval: "Waiting for Approval",
  completed: "Completed",
  blocked: "Blocked",
  skipped: "Skipped",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  not_started: "bg-zinc-700 text-zinc-300",
  ready: "bg-cyan-900/60 text-cyan-300 border border-cyan-700/50",
  in_progress: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
  waiting_for_approval: "bg-purple-900/60 text-purple-300 border border-purple-700/50",
  completed: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
  blocked: "bg-red-900/60 text-red-300 border border-red-700/50",
  skipped: "bg-zinc-800 text-zinc-500",
};
