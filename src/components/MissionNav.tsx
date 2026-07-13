"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

export function MissionNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500/20 transition-colors">
            <Crosshair className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wide text-white">
              OUTCOME AGENT
            </span>
            <span className="hidden sm:block text-[10px] text-zinc-500 tracking-widest uppercase">
              Mission Control
            </span>
          </div>
        </Link>

        {!isHome && (
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isHome
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <Crosshair className="h-3.5 w-3.5" />
              New Mission
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
