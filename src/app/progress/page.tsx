"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { DOSHA_PROFILES } from "@/data/dosha-profiles";
import { loadState } from "@/lib/storage";
import { formatDate, moodLabel } from "@/lib/utils";
import type { AppState, Mood } from "@/types";
import {
  Flame,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Heart,
} from "lucide-react";

export default function ProgressPage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const stats = useMemo(() => {
    if (!state) return null;
    const results = state.practiceResults;
    const practicesCompleted = results.length;
    const totalMinutes = results.reduce((s, r) => s + r.durationMinutes, 0);
    const streak = computeStreak(results.map((r) => r.completedAt));

    const moodCounts: Record<string, number> = {};
    for (const r of results) {
      moodCounts[r.moodBefore] = (moodCounts[r.moodBefore] ?? 0) + 1;
    }
    for (const c of state.checkIns) {
      moodCounts[c.mood] = (moodCounts[c.mood] ?? 0) + 1;
    }
    const mostCommonMood =
      Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const imbalances: Record<string, number> = {};
    for (const c of state.checkIns) {
      if (c.stressScore >= 7) imbalances["High stress"] = (imbalances["High stress"] ?? 0) + 1;
      if (c.sleepScore <= 4) imbalances["Poor sleep"] = (imbalances["Poor sleep"] ?? 0) + 1;
      if (c.energyScore <= 4) imbalances["Low energy"] = (imbalances["Low energy"] ?? 0) + 1;
      if (c.mood === "anxious") imbalances["Anxiety"] = (imbalances["Anxiety"] ?? 0) + 1;
      if (c.mood === "frustrated") imbalances["Frustration"] = (imbalances["Frustration"] ?? 0) + 1;
      if (c.mood === "heavy") imbalances["Heaviness"] = (imbalances["Heaviness"] ?? 0) + 1;
    }
    const mostCommonImbalance =
      Object.entries(imbalances).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None yet";

    const favoriteMap: Record<string, number> = {};
    for (const r of results.filter((x) => x.wouldRepeat)) {
      favoriteMap[r.routineTitle] = (favoriteMap[r.routineTitle] ?? 0) + 1;
    }
    const favorites = Object.entries(favoriteMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title]) => title);

    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const energyBefore = avg(results.map((r) => r.energyBefore));
    const energyAfter = avg(results.map((r) => r.energyAfter));
    const stressBefore = avg(results.map((r) => r.stressBefore));
    const stressAfter = avg(results.map((r) => r.stressAfter));

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    const weekly = results.filter((r) => new Date(r.completedAt) >= weekAgo);
    const monthly = results.filter((r) => new Date(r.completedAt) >= monthAgo);

    return {
      practicesCompleted,
      totalMinutes,
      streak,
      mostCommonMood,
      mostCommonImbalance,
      favorites,
      energyBefore,
      energyAfter,
      stressBefore,
      stressAfter,
      weeklyCount: weekly.length,
      weeklyMinutes: weekly.reduce((s, r) => s + r.durationMinutes, 0),
      monthlyCount: monthly.length,
      monthlyMinutes: monthly.reduce((s, r) => s + r.durationMinutes, 0),
      recent: results.slice(0, 5),
    };
  }, [state]);

  if (!state || !stats) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
          Loading progress…
        </div>
      </AppShell>
    );
  }

  const primary = state.user?.primaryDosha;

  return (
    <AppShell>
      <div className="py-8 animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-leaf">
          Progress
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          Your practice journey
        </h1>
        {primary && (
          <p className="mt-2 text-ink-soft">
            Tracking as a {DOSHA_PROFILES[primary].name}-leaning practitioner.
          </p>
        )}

        {!state.doshaResult ? (
          <div className="mt-8 rounded-3xl bg-white/60 p-6 text-center">
            <p className="text-ink-soft">
              Complete your dosha assessment to start tracking personalized progress.
            </p>
            <Button href="/quiz" className="mt-4">
              Take the quiz
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Practices"
                value={String(stats.practicesCompleted)}
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Minutes"
                value={String(stats.totalMinutes)}
              />
              <StatCard
                icon={<Flame className="h-4 w-4" />}
                label="Streak"
                value={`${stats.streak}d`}
              />
              <StatCard
                icon={<Heart className="h-4 w-4" />}
                label="Top mood"
                value={
                  stats.mostCommonMood === "—"
                    ? "—"
                    : moodLabel(stats.mostCommonMood as Mood)
                }
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/60 p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  This week
                </h2>
                <p className="mt-2 text-3xl font-display font-semibold text-leaf-deep">
                  {stats.weeklyCount}
                </p>
                <p className="text-sm text-ink-soft">
                  practices · {stats.weeklyMinutes} minutes
                </p>
              </div>
              <div className="rounded-3xl bg-white/60 p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  This month
                </h2>
                <p className="mt-2 text-3xl font-display font-semibold text-leaf-deep">
                  {stats.monthlyCount}
                </p>
                <p className="text-sm text-ink-soft">
                  practices · {stats.monthlyMinutes} minutes
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white/60 p-5">
              <h2 className="font-display text-lg font-semibold text-ink">
                Before & after
              </h2>
              {stats.practicesCompleted === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">
                  Complete a practice to see energy and stress shifts.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Delta
                    label="Energy"
                    before={stats.energyBefore}
                    after={stats.energyAfter}
                    better="up"
                  />
                  <Delta
                    label="Stress"
                    before={stats.stressBefore}
                    after={stats.stressAfter}
                    better="down"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-vata-soft/70 p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Most common imbalance
                </h2>
                <p className="mt-2 text-xl font-medium text-vata">
                  {stats.mostCommonImbalance}
                </p>
              </div>
              <div className="rounded-3xl bg-kapha-soft/70 p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Favorite routines
                </h2>
                {stats.favorites.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-soft">
                    Mark routines you’d repeat after practice.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {stats.favorites.map((f) => (
                      <li key={f} className="text-sm text-ink-soft">
                        · {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {stats.recent.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Recent practices
                </h2>
                <ul className="mt-3 space-y-2">
                  {stats.recent.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl bg-white/55 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {r.routineTitle}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {formatDate(r.completedAt)} · {r.durationMinutes} min
                          </p>
                        </div>
                        <span className="rounded-full bg-sand-deep px-2 py-1 text-[11px] capitalize text-ink-soft">
                          {r.difficultyRating.replace("_", " ")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/check-in" size="lg" className="flex-1">
                Practice today
              </Button>
              <Button href="/results" variant="outline" size="lg" className="flex-1">
                View dosha profile
              </Button>
            </div>
          </>
        )}

        <div className="mt-8">
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-white/60 p-4">
      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
        <span className="text-leaf">{icon}</span>
        {label}
      </div>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function Delta({
  label,
  before,
  after,
  better,
}: {
  label: string;
  before: number;
  after: number;
  better: "up" | "down";
}) {
  const improved =
    better === "up" ? after >= before : after <= before;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm text-ink-soft">{before.toFixed(1)}</span>
        <span className="text-ink-soft">→</span>
        <span className="text-lg font-semibold text-ink">{after.toFixed(1)}</span>
        {improved ? (
          better === "up" ? (
            <TrendingUp className="h-4 w-4 text-kapha" />
          ) : (
            <TrendingDown className="h-4 w-4 text-kapha" />
          )
        ) : better === "up" ? (
          <TrendingDown className="h-4 w-4 text-pitta" />
        ) : (
          <TrendingUp className="h-4 w-4 text-pitta" />
        )}
      </div>
    </div>
  );
}

function computeStreak(isoDates: string[]): number {
  if (isoDates.length === 0) return 0;
  const days = new Set(
    isoDates.map((d) => new Date(d).toISOString().slice(0, 10))
  );
  const sorted = Array.from(days).sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);

  if (sorted[0] !== today && sorted[0] !== y) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = (prev.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
