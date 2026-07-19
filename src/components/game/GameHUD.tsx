"use client";

import type { CSSProperties } from "react";
import { SKILL_MAP } from "@/data/skills";
import type { EngineSnapshot } from "@/game/engine";

interface Props {
  snap: EngineSnapshot;
}

export function GameHUD({ snap }: Props) {
  const composurePct = Math.max(0, (snap.composure / snap.maxComposure) * 100);
  const xpPct = Math.max(0, (snap.xpIntoLevel / snap.xpForLevel) * 100);

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-meta">
          <span className="hud-env">{snap.environmentName}</span>
          <span className="hud-wave">Wave {snap.wave}</span>
        </div>
        <div className="hud-timer" aria-label="Wave time remaining">
          {Math.ceil(snap.waveTimeLeft)}s
        </div>
      </div>

      <div className="bars">
        <div className="bar-row">
          <span>Composure</span>
          <div className="bar">
            <div className="bar-fill composure" style={{ width: `${composurePct}%` }} />
          </div>
        </div>
        <div className="bar-row">
          <span>
            Lv {snap.level} · Confidence {Math.round(snap.confidence)}
          </span>
          <div className="bar">
            <div className="bar-fill xp" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {snap.bossActive && snap.bossName && (
        <div className="boss-banner animate-fade-in">High-pressure: {snap.bossName}</div>
      )}

      <div className="skill-dock">
        {snap.skills.map((s) => {
          const def = SKILL_MAP[s.id];
          return (
            <div
              key={s.id}
              className="skill-chip"
              style={{ "--skill-color": def.color } as CSSProperties}
              title={def.description}
            >
              <span className="skill-dot" />
              <span>
                {def.name}
                <small> Lv{s.level}</small>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
