"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileBarChart,
  Activity,
  Menu,
  X,
  CloudLightning,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Scanner", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/report", label: "Daily Report", icon: FileBarChart },
  { href: "/activity", label: "Agent Log", icon: Activity },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--soa-border)] bg-[var(--soa-surface)]/90 backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--soa-teal)] text-white shadow-sm group-hover:scale-[1.03] transition-transform">
              <CloudLightning className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-display)] text-base sm:text-lg font-bold tracking-tight text-[var(--soa-ink)]">
                Storm Opportunity Agent
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.18em] text-[var(--soa-muted)]">
                Florida restoration intel
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--soa-teal)]/10 text-[var(--soa-teal)]"
                      : "text-[var(--soa-muted)] hover:text-[var(--soa-ink)] hover:bg-black/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-[var(--soa-ink)] hover:bg-black/5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden border-t border-[var(--soa-border)] bg-[var(--soa-surface)] px-4 py-3 flex flex-col gap-1 animate-in-fade">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-[var(--soa-teal)]/10 text-[var(--soa-teal)]"
                      : "text-[var(--soa-muted)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
