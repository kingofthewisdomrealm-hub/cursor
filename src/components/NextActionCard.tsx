import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface NextActionCardProps {
  action: string;
  className?: string;
}

export function NextActionCard({ action, className }: NextActionCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-zinc-900/60 p-6 glow-border",
        className
      )}
    >
      <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Next Best Action
          </span>
        </div>
        <p className="text-xl font-bold text-white leading-snug">{action}</p>
      </div>
    </div>
  );
}
