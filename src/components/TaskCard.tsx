import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import type { Task } from "@/types/mission";
import { ChevronRight } from "lucide-react";

interface TaskCardProps {
  task: Task;
  missionId: string;
  compact?: boolean;
}

export function TaskCard({ task, missionId, compact = false }: TaskCardProps) {
  return (
    <Link
      href={`/mission/${missionId}/task/${task.id}`}
      className="group block rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 transition-all hover:border-cyan-500/30 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={task.status} />
            {task.approval_required && (
              <span className="text-[10px] text-purple-400 uppercase tracking-wider">
                Approval needed
              </span>
            )}
          </div>
          <h4 className="font-semibold text-white group-hover:text-cyan-100 transition-colors truncate">
            {task.title}
          </h4>
          {!compact && task.reason && (
            <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{task.reason}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  );
}
