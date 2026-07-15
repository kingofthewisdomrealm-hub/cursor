"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DoshaResultBadge } from "@/components/landing/DoshaCards";
import { DoshaChart } from "@/components/results/DoshaChart";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { DOSHA_PROFILES } from "@/data/dosha-profiles";
import { loadState } from "@/lib/storage";
import type { AppState } from "@/types";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    const s = loadState();
    if (!s.doshaResult) {
      router.replace("/quiz");
      return;
    }
    setState(s);
  }, [router]);

  if (!state?.doshaResult) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
          Loading your results…
        </div>
      </AppShell>
    );
  }

  const { primary, secondary, percentages } = state.doshaResult;
  const profile = DOSHA_PROFILES[primary];

  return (
    <AppShell>
      <div className="py-8 animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-leaf">
          Your dosha profile
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          You are primarily {profile.name}
        </h1>
        <p className="mt-2 text-ink-soft">
          with {DOSHA_PROFILES[secondary].name} as your secondary influence.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <DoshaResultBadge dosha={primary} label="Primary dosha" />
          <DoshaResultBadge dosha={secondary} label="Secondary dosha" />
        </div>

        <div className="mt-8 rounded-3xl bg-white/60 p-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            Percentage breakdown
          </h2>
          <div className="mt-4">
            <DoshaChart percentages={percentages} />
          </div>
        </div>

        <section className="mt-8 space-y-6">
          <div className={cn("rounded-3xl p-5", profile.bgClass)}>
            <h2 className="font-display text-lg font-semibold text-ink">
              Personality & body profile
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {profile.personality}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {profile.bodyProfile}
            </p>
          </div>

          <InfoBlock title="Strengths" items={profile.strengths} tone="positive" />
          <InfoBlock
            title="Common imbalance signs"
            items={profile.imbalanceSigns}
            tone="neutral"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock
              title="What to increase"
              items={profile.increase}
              tone="positive"
              icon={<Plus className="h-4 w-4 text-kapha" />}
            />
            <InfoBlock
              title="What to reduce"
              items={profile.reduce}
              tone="caution"
              icon={<Minus className="h-4 w-4 text-pitta" />}
            />
          </div>

          <div className="rounded-3xl bg-white/60 p-5 space-y-4">
            <Rec row="Recommended yoga" value={profile.recommendedYoga} />
            <Rec row="Recommended breathing" value={profile.recommendedBreathing} />
            <Rec row="Recommended meditation" value={profile.recommendedMeditation} />
          </div>
        </section>

        <Button href="/check-in" size="lg" className="mt-8 w-full">
          Create My Yoga Routine
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="mt-8">
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}

function InfoBlock({
  title,
  items,
  tone,
  icon,
}: {
  title: string;
  items: string[];
  tone: "positive" | "neutral" | "caution";
  icon?: React.ReactNode;
}) {
  const bg =
    tone === "positive"
      ? "bg-kapha-soft/60"
      : tone === "caution"
        ? "bg-pitta-soft/60"
        : "bg-white/60";
  return (
    <div className={cn("rounded-3xl p-5", bg)}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-ink-soft">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf/50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Rec({ row, value }: { row: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
        {row}
      </p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}
