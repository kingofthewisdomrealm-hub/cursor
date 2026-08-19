"use client";

import {
  DIAGNOSED_LEVEL,
  LEVEL_BY_ID,
  type MasteryLevelId,
  isLevelCleared,
  isLevelUnlocked,
} from "@/data/mastery";

interface LevelPanelProps {
  viewedLevel: MasteryLevelId;
  completed: Record<number, string[]>;
  onToggle: (levelId: MasteryLevelId, missionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function LevelPanel({
  viewedLevel,
  completed,
  onToggle,
  onNext,
  onPrev,
}: LevelPanelProps) {
  const level = LEVEL_BY_ID[viewedLevel];
  const unlocked = isLevelUnlocked(viewedLevel, completed);
  const cleared = isLevelCleared(viewedLevel, completed);
  const done = completed[viewedLevel] ?? [];
  const canNext = viewedLevel < 5 && cleared;
  const canPrev = viewedLevel > 0;

  return (
    <section
      className="animate-rise mt-8 rounded-sm border border-white/10 bg-panel/80 p-4 sm:p-5"
      style={{ boxShadow: `inset 0 1px 0 ${level.accent}22` }}
      aria-live="polite"
    >
      <p
        className="font-display text-[11px] uppercase tracking-[0.28em]"
        style={{ color: level.accent }}
      >
        Level {level.id}
        {viewedLevel === DIAGNOSED_LEVEL ? " · diagnosed" : ""}
        {cleared ? " · cleared" : ""}
      </p>
      <h2 className="mt-2 font-display text-2xl tracking-tight text-white sm:text-3xl">
        {level.name}
      </h2>
      <p className="mt-1 text-sm text-fog">{level.epithet}</p>

      {!unlocked ? (
        <p className="mt-4 text-sm leading-relaxed text-amber">
          Locked. Clear every mission on Level {viewedLevel - 1} first. Peeking
          at the peak without the scar tissue is how you stay a sprinter.
        </p>
      ) : (
        <>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-fog">
            <p>
              <span className="font-display text-[11px] uppercase tracking-[0.18em] text-white/70">
                Looks like
              </span>
              <br />
              {level.looksLike}
            </p>
            <p>
              <span className="font-display text-[11px] uppercase tracking-[0.18em] text-white/70">
                You, honestly
              </span>
              <br />
              {level.you}
            </p>
            <p>
              <span className="font-display text-[11px] uppercase tracking-[0.18em] text-white/70">
                Why it matters
              </span>
              <br />
              {level.whyItMatters}
            </p>
          </div>

          <ol className="mt-6 grid gap-2">
            {level.missions.map((mission) => {
              const checked = done.includes(mission.id);
              return (
                <li key={mission.id}>
                  <label className="flex cursor-pointer gap-3 border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:border-white/25">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(level.id, mission.id)}
                      className="mt-1 size-4 shrink-0 accent-current"
                      style={{ accentColor: level.accent }}
                    />
                    <span>
                      <span className="block text-sm text-white">{mission.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-fog">
                        {mission.detail}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="flex-1 border border-white/15 px-3 py-3 font-display text-[11px] uppercase tracking-[0.18em] text-fog disabled:opacity-30"
        >
          Down
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="flex-[2] px-3 py-3 font-display text-[11px] uppercase tracking-[0.18em] text-[#071018] disabled:opacity-35"
          style={{
            background: canNext ? level.accent : "rgba(255,255,255,0.12)",
            color: canNext ? "#071018" : "#9aa8c7",
          }}
        >
          {viewedLevel === 5 && cleared
            ? "Peak held"
            : canNext
              ? `Climb to L${viewedLevel + 1}`
              : unlocked
                ? "Check every mission"
                : "Locked"}
        </button>
      </div>
    </section>
  );
}
