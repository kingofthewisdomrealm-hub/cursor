import { cn, formatProgress } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  target: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  current,
  target,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const pct = formatProgress(current, target);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Progress</span>
          <span className="font-mono font-semibold text-cyan-400">
            {current} <span className="text-zinc-600">/</span> {target}
            <span className="ml-2 text-zinc-500">({pct}%)</span>
          </span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800/80 border border-zinc-700/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
