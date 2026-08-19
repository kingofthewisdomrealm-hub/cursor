"use client";

import Link from "next/link";
import { PACKS } from "@/data/packs";
import { useGameStore } from "@/store/gameStore";

export default function HomePage() {
  const progression = useGameStore((s) => s.progression);
  const selectedPackId = useGameStore((s) => s.selectedPackId);
  const setSelectedPack = useGameStore((s) => s.setSelectedPack);
  const startRun = useGameStore((s) => s.startRun);
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow absolute -left-10 top-16 h-48 w-48 rounded-full bg-neon/10 blur-3xl" />
        <div className="absolute -right-8 top-40 h-56 w-56 rounded-full bg-rose/10 blur-3xl" />
        <div className="animate-scan pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-neon/5 to-transparent" />
      </div>

      <section className="relative animate-rise">
        <p className="font-display text-[11px] uppercase tracking-[0.28em] text-neon">
          Learning is progression
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
          Communication
          <br />
          <span className="text-neon">Survival</span>
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-fog">
          Vampire Survivors meets Duolingo. Survive the horde, then earn every
          upgrade by choosing the best response.
        </p>

        <div className="relative mt-8 -mx-4 h-44 overflow-hidden sm:mx-0 sm:h-52">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(57,243,255,0.18),_transparent_55%),linear-gradient(160deg,#0a1228_0%,#1a0b24_55%,#070b16_100%)]" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.04) 18px, rgba(255,255,255,0.04) 19px), repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 19px)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-lg text-white sm:text-xl">
              Communication is power
            </p>
            <p className="mt-2 max-w-xs text-sm text-fog">
              Correct answers unlock fire rate, survivors, and neon weapons.
            </p>
          </div>
        </div>

        <Link
          href="/play"
          onClick={() => {
            setPhase("combat");
            startRun();
          }}
          className="mt-8 flex w-full items-center justify-center bg-neon px-5 py-4 font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#071018] transition hover:brightness-110 active:scale-[0.99]"
        >
          Enter the city
        </Link>
        <Link
          href="/mastery"
          className="mt-3 flex w-full items-center justify-center border border-rose/50 px-5 py-4 font-display text-sm font-semibold uppercase tracking-[0.18em] text-rose transition hover:bg-rose/10 active:scale-[0.99]"
        >
          Become dangerous
        </Link>
      </section>

      <section className="relative mt-10">
        <h2 className="font-display text-lg text-white">Communication pack</h2>
        <p className="mt-1 text-sm text-fog">
          Complete runs to unlock new categories. Meta XP:{" "}
          <span className="text-mint">{progression.totalXp}</span>
        </p>
        <div className="mt-4 grid gap-2">
          {PACKS.map((pack) => {
            const unlocked = progression.unlockedPackIds.includes(pack.id);
            const selected = selectedPackId === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && setSelectedPack(pack.id)}
                className={`border px-3 py-3 text-left transition ${
                  selected
                    ? "border-neon/60 bg-neon/10"
                    : unlocked
                      ? "border-white/10 bg-white/[0.03] hover:border-white/25"
                      : "border-white/5 bg-white/[0.02] opacity-45"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-sm text-white">{pack.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-fog">
                    {unlocked ? (selected ? "Selected" : "Unlocked") : `${pack.unlockXp} XP`}
                  </p>
                </div>
                <p className="mt-1 text-xs text-fog">{pack.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative mt-10 border-t border-white/10 pt-6 text-sm text-fog">
        <p>
          Best score <span className="text-white">{progression.bestScore}</span> ·
          Best accuracy{" "}
          <span className="text-neon">{progression.bestAccuracy}%</span> · Runs{" "}
          {progression.runsCompleted}
        </p>
        <p className="mt-3 text-xs text-fog/70">
          Endless survival · 6 enemy types · 50 scenarios · 10 upgrades
        </p>
      </section>
    </main>
  );
}
