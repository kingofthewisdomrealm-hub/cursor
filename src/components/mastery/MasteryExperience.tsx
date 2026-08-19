"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DIAGNOSED_LEVEL, LEVELS } from "@/data/mastery";
import { LevelPanel } from "@/components/mastery/LevelPanel";
import { Pyramid } from "@/components/mastery/Pyramid";
import { clearedCount, useMasteryStore } from "@/store/masteryStore";

export function MasteryExperience() {
  const [hydrated, setHydrated] = useState(false);
  const introSeen = useMasteryStore((s) => s.introSeen);
  const viewedLevel = useMasteryStore((s) => s.viewedLevel);
  const completed = useMasteryStore((s) => s.completed);
  const dismissIntro = useMasteryStore((s) => s.dismissIntro);
  const setViewedLevel = useMasteryStore((s) => s.setViewedLevel);
  const toggleMission = useMasteryStore((s) => s.toggleMission);
  const goNext = useMasteryStore((s) => s.goNext);
  const goPrev = useMasteryStore((s) => s.goPrev);
  const resetClimb = useMasteryStore((s) => s.resetClimb);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const persistApi = useMasteryStore.persist;
    if (persistApi.hasHydrated()) {
      finish();
      return;
    }
    return persistApi.onFinishHydration(finish);
  }, []);

  const cleared = clearedCount(completed);
  const peak = cleared === LEVELS.length;

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center font-display text-sm tracking-wider text-rose">
        Loading pyramid…
      </main>
    );
  }

  if (!introSeen) {
    return (
      <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
        <p className="font-display text-[11px] uppercase tracking-[0.28em] text-rose">
          Hierarchy of mastery
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
          Become
          <br />
          <span className="text-rose">dangerous</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-fog">
          Six stones. You are not at the bottom. You are not at the peak. You
          are Level {DIAGNOSED_LEVEL} — Cloud-agent product sprinter. This climb
          is personal: your 19 agents, your 16 products, your overwritten{" "}
          <span className="text-white">main</span>.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-fog">
          Tap a stone. Check every mission. The next level unlocks only when
          you commit — not when an agent opens a PR.
        </p>
        <button
          type="button"
          onClick={dismissIntro}
          className="mt-8 w-full bg-rose px-5 py-4 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110 active:scale-[0.99]"
        >
          Begin at the base
        </button>
        <Link
          href="/"
          className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-fog/80"
        >
          Back to Communication Survival
        </Link>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-dvh max-w-lg px-4 pb-16 pt-6">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.28em] text-rose">
            Ascent {cleared}/{LEVELS.length}
          </p>
          <h1 className="mt-1 font-display text-2xl text-white">The pyramid</h1>
        </div>
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.16em] text-fog"
        >
          Game
        </Link>
      </header>

      {peak ? (
        <p className="mb-5 border border-rose/40 bg-rose/10 px-3 py-3 text-sm text-white">
          Peak held. Dangerous is a practice, not a badge. Keep one repo alive.
        </p>
      ) : null}

      <Pyramid
        viewedLevel={viewedLevel}
        completed={completed}
        onSelect={setViewedLevel}
      />

      <LevelPanel
        viewedLevel={viewedLevel}
        completed={completed}
        onToggle={toggleMission}
        onNext={goNext}
        onPrev={goPrev}
      />

      <button
        type="button"
        onClick={resetClimb}
        className="mt-8 w-full text-center text-[11px] uppercase tracking-[0.18em] text-fog/50"
      >
        Reset climb
      </button>
    </main>
  );
}
