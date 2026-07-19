"use client";

import { useGameStore } from "@/store/gameStore";
import { sfx } from "@/game/audio";

export function ChallengeOverlay() {
  const phase = useGameStore((s) => s.phase);
  const scenario = useGameStore((s) => s.currentScenario);
  const answerChallenge = useGameStore((s) => s.answerChallenge);

  if (phase !== "challenge" || !scenario) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-[#050812]/72 p-3 backdrop-blur-[2px] sm:items-center">
      <div className="animate-rise w-full max-w-md border border-neon/25 bg-[#0d1428]/95 p-4 shadow-[0_0_40px_rgba(57,243,255,0.12)] sm:p-5">
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-neon">
          Communication challenge
        </p>
        <p className="mt-3 text-sm text-fog">
          <span className="text-amber">{scenario.speaker}:</span> “{scenario.prompt}”
        </p>
        <p className="mt-2 text-xs text-fog/70">Choose the best response.</p>
        <div className="mt-4 flex flex-col gap-2">
          {scenario.options.map((opt, idx) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                answerChallenge(opt.id);
                const correct = opt.id === scenario.correctOptionId;
                if (correct) sfx.success();
                else sfx.fail();
              }}
              className="group border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition hover:border-neon/50 hover:bg-neon/10 active:scale-[0.99]"
            >
              <span className="mr-2 font-display text-xs text-neon">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span className="text-sm leading-snug text-white/90">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
