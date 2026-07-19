"use client";

import { getUpgrade } from "@/data/upgrades";
import { useGameStore } from "@/store/gameStore";
import { sfx } from "@/game/audio";

export function UpgradeOverlay() {
  const phase = useGameStore((s) => s.phase);
  const offered = useGameStore((s) => s.offeredUpgrades);
  const pickUpgrade = useGameStore((s) => s.pickUpgrade);

  if (phase !== "upgrade") return null;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-[#050812]/70 p-3 backdrop-blur-[2px] sm:items-center">
      <div className="animate-rise w-full max-w-md border border-neon/30 bg-[#0d1428]/96 p-4 sm:p-5">
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-neon">
          Upgrade unlocked
        </p>
        <h2 className="mt-2 font-display text-xl text-white">
          Communication is power
        </h2>
        <p className="mt-1 text-sm text-fog">Pick one — it changes the battlefield now.</p>

        <div className="mt-4 flex flex-col gap-2">
          {offered.map((id) => {
            const u = getUpgrade(id);
            if (!u) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sfx.upgrade();
                  pickUpgrade(id);
                }}
                className="border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition hover:bg-white/[0.06] active:scale-[0.99]"
                style={{ boxShadow: `inset 3px 0 0 ${u.neon}` }}
              >
                <p className="font-display text-sm" style={{ color: u.neon }}>
                  {u.name}
                </p>
                <p className="mt-1 text-xs text-fog">{u.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
