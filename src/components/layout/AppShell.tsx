"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  BedDouble,
  BookOpenCheck,
  LineChart,
  Sparkles,
  Bell,
  LogOut,
  Menu,
  X,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStayFlow } from "@/hooks/useStayFlow";
import { stayStore } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/types";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/rooms", label: "Rooms", icon: BedDouble },
  { href: "/reservations", label: "Reservations", icon: BookOpenCheck },
  { href: "/revenue", label: "Revenue", icon: LineChart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, notifications } = useStayFlow();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = useMemo(
    () => notifications.filter((n) => !n.read && n.user_id === user?.id).length,
    [notifications, user?.id]
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user === null && typeof window !== "undefined") {
      // wait one tick for hydrate
      const t = setTimeout(() => {
        if (!stayStore.getState().user) router.replace("/login");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] border-r border-slate-200/80 bg-[#0b1f24]/[0.97] text-teal-50 shadow-xl backdrop-blur transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Link href="/dashboard" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/20 text-teal-200 ring-1 ring-teal-300/30 transition group-hover:scale-105">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold tracking-tight text-white">
                  StayFlow
                </p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-teal-200/70">
                  Property OS
                </p>
              </div>
            </Link>
            <button
              className="rounded-lg p-1 text-teal-100/70 lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-teal-400/15 text-white shadow-inner ring-1 ring-teal-300/20"
                      : "text-teal-100/75 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/30 text-xs font-bold text-teal-50">
                {initials(user.full_name.split(" ")[0] ?? "U", user.full_name.split(" ")[1])}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.full_name}
                </p>
                <p className="truncate text-xs text-teal-100/60">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-teal-100/80 hover:bg-white/5 hover:text-white"
              onClick={() => {
                stayStore.logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 bg-[#f4f7f8]/80 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <p className="hidden text-sm text-slate-500 sm:block">
              Operating system for modern accommodations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stayStore.resetDemo();
                router.refresh();
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                ) : null}
              </Button>
              {notifOpen ? (
                <div className="absolute right-0 top-12 z-30 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Notifications
                    </p>
                    <button
                      className="text-xs font-medium text-teal-700 hover:underline"
                      onClick={() => stayStore.markAllNotificationsRead()}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500">You&apos;re all caught up.</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          className={cn(
                            "block w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50",
                            !n.read && "bg-teal-50/40"
                          )}
                          onClick={() => stayStore.markNotificationRead(n.id)}
                        >
                          <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
