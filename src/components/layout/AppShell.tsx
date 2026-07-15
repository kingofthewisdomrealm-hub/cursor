"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Sparkles, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quiz", label: "Quiz", icon: ClipboardList },
  { href: "/check-in", label: "Check-in", icon: Activity },
  { href: "/routine", label: "Routine", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-sand/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Logo size="sm" />
        <nav className="hidden items-center gap-1 sm:flex">
          {links.slice(1).map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-leaf/10 text-leaf-deep font-medium"
                    : "text-ink-soft hover:bg-sand-deep hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const hideOn = pathname === "/practice";
  if (hideOn) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/5 bg-sand/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors",
                active ? "text-leaf-deep" : "text-ink-soft"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.25px]")} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      {showNav && <AppHeader />}
      <main className="mx-auto w-full max-w-3xl px-4">{children}</main>
      {showNav && <MobileNav />}
    </div>
  );
}
