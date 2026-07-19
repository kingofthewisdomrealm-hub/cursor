"use client";

import { useGameStore } from "@/store/gameStore";

export function CombatHud() {
  const hud = useGameStore((s) => s.hud);
  const phase = useGameStore((s) => s.phase);

  if (phase === "score" || phase === "menu") return null;

  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const xpPct = Math.max(0, Math.min(100, (hud.xp / hud.xpToNext) * 100));

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/70">
            <span>HP {hud.hp}</span>
            <span className="text-neon">Lv {hud.level}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-rose to-amber transition-[width] duration-200"
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <div className="mt-2 h-1.5 overflow-hidden bg-white/10">
            <div
              className="h-full bg-mint transition-[width] duration-200"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
        <div className="shrink-0 text-right font-display text-[11px] uppercase tracking-wider text-white/75">
          <p>
            Wave <span className="text-white">{hud.wave}</span>
          </p>
          <p className="text-neon">{Math.ceil(hud.waveTimer)}s</p>
          <p className="mt-1 text-fog">{hud.kills} kills</p>
        </div>
      </div>
      {phase === "combat" && (
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/35">
          Drag to move · WASD on desktop
        </p>
      )}
    </div>
  );
}
