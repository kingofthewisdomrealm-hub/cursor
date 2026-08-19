"use client";

import {
  DIAGNOSED_LEVEL,
  LEVELS,
  type MasteryLevelId,
  isLevelCleared,
  isLevelUnlocked,
} from "@/data/mastery";

interface PyramidProps {
  viewedLevel: MasteryLevelId;
  completed: Record<number, string[]>;
  onSelect: (id: MasteryLevelId) => void;
}

export function Pyramid({ viewedLevel, completed, onSelect }: PyramidProps) {
  return (
    <div className="relative mx-auto w-full max-w-md px-2">
      <div className="pointer-events-none absolute inset-x-8 -top-8 h-24 bg-[radial-gradient(ellipse_at_center,_rgba(255,107,61,0.28),_transparent_70%)] blur-md" />
      <ol className="relative flex flex-col items-center gap-1.5">
        {[...LEVELS].reverse().map((level) => {
          const unlocked = isLevelUnlocked(level.id, completed);
          const cleared = isLevelCleared(level.id, completed);
          const viewed = viewedLevel === level.id;
          const here = level.id === DIAGNOSED_LEVEL;
          const status = here
            ? " · you are here"
            : cleared
              ? " · cleared"
              : unlocked
                ? ""
                : " · locked";

          return (
            <li
              key={level.id}
              className="relative flex justify-center"
              style={{ width: `${level.width}%` }}
            >
              <button
                type="button"
                onClick={() => onSelect(level.id)}
                aria-current={viewed ? "step" : undefined}
                aria-label={`${level.name}, level ${level.id}${here ? ", you are here" : ""}${unlocked ? "" : ", locked"}`}
                className={`mastery-stone relative w-full px-2 py-3 text-center transition duration-300 ${
                  viewed ? "scale-[1.03]" : "hover:brightness-110"
                } ${unlocked ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  background: unlocked
                    ? `linear-gradient(180deg, ${level.accent}33, ${level.accent}14)`
                    : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                  boxShadow: viewed
                    ? `0 0 0 1px ${level.accent}, 0 8px 28px ${level.glow}`
                    : `0 0 0 1px ${unlocked ? `${level.accent}55` : "rgba(255,255,255,0.08)"}`,
                  color: unlocked ? level.accent : "#6d7690",
                }}
              >
                <span className="block font-display text-[10px] uppercase tracking-[0.22em]">
                  L{level.id}
                  {status}
                </span>
                <span className="mt-0.5 block font-display text-sm tracking-wide text-white sm:text-base">
                  {level.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center font-display text-[10px] uppercase tracking-[0.28em] text-fog">
        Peak is dangerous · Base is unused
      </p>
    </div>
  );
}
