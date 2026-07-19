"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import { CombatHud } from "@/components/game/CombatHud";
import { ChallengeOverlay } from "@/components/overlays/ChallengeOverlay";
import { ExplanationOverlay } from "@/components/overlays/ExplanationOverlay";
import { ScoreOverlay } from "@/components/overlays/ScoreOverlay";
import { UpgradeOverlay } from "@/components/overlays/UpgradeOverlay";
import { useGameStore } from "@/store/gameStore";

const PhaserGame = dynamic(
  () =>
    import("@/components/game/PhaserGame").then((m) => m.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#070b16] font-display text-sm tracking-wider text-neon">
        Loading battlefield…
      </div>
    ),
  },
);

export default function PlayPage() {
  const phase = useGameStore((s) => s.phase);
  const startRun = useGameStore((s) => s.startRun);
  const setPhase = useGameStore((s) => s.setPhase);

  useEffect(() => {
    if (phase === "menu" || phase === "score") {
      // Arriving from menu without startRun already called
      if (phase === "menu") startRun();
    }
  }, [phase, startRun]);

  return (
    <main className="mx-auto flex h-dvh max-w-lg flex-col bg-ink">
      <header className="flex items-center justify-between px-3 py-2">
        <Link
          href="/"
          onClick={() => setPhase("menu")}
          className="font-display text-[11px] uppercase tracking-[0.2em] text-fog hover:text-neon"
        >
          Exit
        </Link>
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-neon">
          Communication Survival
        </p>
        <span className="w-10" />
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <PhaserGame />
        <CombatHud />
        <ChallengeOverlay />
        <ExplanationOverlay />
        <UpgradeOverlay />
        <ScoreOverlay />
      </div>
    </main>
  );
}
