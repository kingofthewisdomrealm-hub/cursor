"use client";

import { useGameStore } from "@/store/gameStore";

export function ExplanationOverlay() {
  const phase = useGameStore((s) => s.phase);
  const scenario = useGameStore((s) => s.currentScenario);
  const correct = useGameStore((s) => s.lastAnswerCorrect);
  const continueAfterExplanation = useGameStore(
    (s) => s.continueAfterExplanation,
  );

  if (phase !== "explanation" || !scenario) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-[#050812]/75 p-3 backdrop-blur-[2px] sm:items-center">
      <div className="animate-rise w-full max-w-md border border-white/10 bg-[#0d1428]/96 p-4 sm:p-5">
        <p
          className={`font-display text-sm tracking-wide ${
            correct ? "text-mint" : "text-rose"
          }`}
        >
          {correct ? "Correct — squad powered up" : "Miss — no upgrade this wave"}
        </p>

        <ul className="mt-4 space-y-3 text-sm leading-snug text-white/85">
          <li>
            <span className="text-mint">Why this works</span>
            <p className="mt-1 text-fog">{scenario.why}</p>
          </li>
          <li>
            <span className="text-neon">Psychology</span>
            <p className="mt-1 text-fog">{scenario.psychology}</p>
          </li>
          <li>
            <span className="text-amber">Real-world</span>
            <p className="mt-1 text-fog">{scenario.application}</p>
          </li>
        </ul>

        <button
          type="button"
          onClick={continueAfterExplanation}
          className="mt-5 w-full bg-neon px-4 py-3 font-display text-sm font-semibold uppercase tracking-wider text-[#071018] transition hover:brightness-110"
        >
          {correct ? "Choose upgrade" : "Back to the fight"}
        </button>
      </div>
    </div>
  );
}
