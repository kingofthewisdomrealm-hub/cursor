import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MissionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}

export function MissionCard({
  title,
  subtitle,
  children,
  className,
  highlight = false,
}: MissionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-zinc-900/40 backdrop-blur-sm p-6",
        highlight
          ? "border-cyan-500/20 glow-border"
          : "border-zinc-800/80",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-lg font-semibold text-white">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
