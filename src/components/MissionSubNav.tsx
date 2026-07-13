"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const links = [
  { href: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "briefing", label: "Briefing", icon: MessageSquare },
  { href: "plan", label: "Plan", icon: ListChecks },
  { href: "results", label: "Results", icon: TrendingUp },
];

interface MissionSubNavProps {
  missionId: string;
}

export function MissionSubNav({ missionId }: MissionSubNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {links.map(({ href, label, icon: Icon }) => {
        const fullHref = `/mission/${missionId}/${href}`;
        const active = pathname.includes(`/${href}`);

        return (
          <Link
            key={href}
            href={fullHref}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
