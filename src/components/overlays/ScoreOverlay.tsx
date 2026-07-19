"use client";

import Link from "next/link";
import { PACKS } from "@/data/packs";
import { getAccuracy, getRunScore, useGameStore } from "@/store/gameStore";

export function ScoreOverlay() {
  const phase = useGameStore((s) => s.phase);
  const run = useGameStore((s) => s.run);
  const progression = useGameStore((s) => s.progression);
  const startRun = useGameStore((s) => s.startRun);
  const setPhase = useGameStore((s) => s.setPhase);

  if (phase !== "score") return null;

  const score = getRunScore(run);
  const accuracy = getAccuracy(run);
  const newlyUnlocked = PACKS.filter(
    (p) =>
      progression.unlockedPackIds.includes(p.id) &&
      progression.totalXp - 25 < p.unlockXp + 200 &&
      p.unlockXp > 0 &&
      progression.totalXp >= p.unlockXp,
  ).slice(0, 2);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#050812]/88 p-4 backdrop-blur-sm">
      <div className="animate-rise w-full max-w-md border border-white/10 bg-[#0d1428] p-5">
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-rose">
          Run complete
        </p>
        <h2 className="mt-2 font-display text-3xl text-white">Score {score}</h2>
        <p className="mt-1 text-sm text-fog">
          Accuracy{" "}
          <span className="text-neon">{accuracy}%</span> ·{" "}
          {run.questionsCorrect}/{run.questionsAnswered} correct
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Kills" value={String(run.kills)} />
          <Stat label="Survived" value={`${run.survivalSeconds}s`} />
          <Stat label="Wave" value={String(run.wave)} />
          <Stat label="Level" value={String(run.level)} />
        </dl>

        <div className="mt-5 border-t border-white/10 pt-4 text-sm text-fog">
          <p>
            Meta XP{" "}
            <span className="text-mint">{progression.totalXp}</span> · Best{" "}
            {progression.bestScore}
          </p>
          {newlyUnlocked.length > 0 && (
            <p className="mt-2 text-amber">
              Unlocked: {newlyUnlocked.map((p) => p.name).join(", ")}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => startRun()}
            className="w-full bg-neon px-4 py-3 font-display text-sm font-semibold uppercase tracking-wider text-[#071018]"
          >
            Run again
          </button>
          <Link
            href="/"
            onClick={() => setPhase("menu")}
            className="w-full border border-white/15 px-4 py-3 text-center font-display text-sm uppercase tracking-wider text-white/80"
          >
            Main menu
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wider text-fog/70">{label}</dt>
      <dd className="mt-1 font-display text-lg text-white">{value}</dd>
    </div>
  );
}
