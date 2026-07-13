"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Sparkles,
  Camera,
  Handshake,
  LayoutDashboard,
} from "lucide-react";

const TABS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/files", label: "Files", icon: FileText },
  { href: "/supplements", label: "Supplements", icon: Sparkles },
  { href: "/damage", label: "Damage", icon: Camera },
  { href: "/negotiation", label: "Negotiation", icon: Handshake },
];

export function ClaimSubNav({ claimId }: { claimId: string }) {
  const pathname = usePathname();
  const base = `/claims/${claimId}`;

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 mb-6">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const active =
          tab.href === ""
            ? pathname === base
            : pathname.startsWith(href);

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all",
              active
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
