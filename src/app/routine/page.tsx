"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { PoseIcon } from "@/components/ui/PoseIcon";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { DOSHA_PROFILES } from "@/data/dosha-profiles";
import { loadState } from "@/lib/storage";
import { formatDuration, outcomeLabel, cn } from "@/lib/utils";
import type { YogaRoutine } from "@/types";
import { ArrowRight, Clock, RefreshCw, Sparkles } from "lucide-react";

export default function RoutinePage() {
  const router = useRouter();
  const [routine, setRoutine] = useState<YogaRoutine | null>(null);

  useEffect(() => {
    const s = loadState();
    if (!s.currentRoutine) {
      router.replace("/check-in");
      return;
    }
    setRoutine(s.currentRoutine);
  }, [router]);

  if (!routine) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
          Loading your routine…
        </div>
      </AppShell>
    );
  }

  const profile = DOSHA_PROFILES[routine.targetDosha];

  return (
    <AppShell>
      <div className="py-8 animate-fade-up">
        <div className={cn("rounded-3xl p-5", profile.bgClass)}>
          <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <Sparkles className="h-4 w-4" />
            Personalized for {profile.name}
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {routine.title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{routine.focus}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 font-medium text-ink">
              <Clock className="h-3.5 w-3.5" />
              {routine.duration} minutes
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium capitalize text-ink">
              {routine.difficulty}
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium text-ink">
              {outcomeLabel(routine.targetOutcome)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button href="/practice" size="lg" className="flex-1">
            Begin practice
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/check-in" variant="outline" size="lg">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold text-ink">
          Sequence
        </h2>
        <ol className="mt-4 space-y-3">
          {routine.poses.map((pose, index) => (
            <li
              key={`${pose.id}-${index}`}
              className="rounded-3xl bg-white/60 p-4 animate-fade-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex gap-3">
                <PoseIcon image={pose.image} dosha={routine.targetDosha} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-ink-soft">
                        {index + 1}. {pose.category.replace("_", " ")}
                      </p>
                      <h3 className="font-medium text-ink">{pose.name}</h3>
                      <p className="text-xs italic text-ink-soft">
                        {pose.sanskritName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-ink-soft">
                      <p className="font-semibold text-ink">
                        {formatDuration(pose.holdSeconds)}
                      </p>
                      {pose.reps && <p>{pose.reps} reps</p>}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {pose.instructions}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-sand-deep px-2.5 py-1 text-[11px] text-ink-soft">
                      Benefit:{" "}
                      {pose.benefitTags.slice(0, 2).join(", ")}
                    </span>
                    <span className="rounded-full bg-sand-deep px-2.5 py-1 text-[11px] text-ink-soft">
                      Beginner: {pose.beginnerModification}
                    </span>
                  </div>
                  {pose.notes && (
                    <p className="mt-2 text-xs font-medium text-leaf-deep">
                      {pose.notes}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}
