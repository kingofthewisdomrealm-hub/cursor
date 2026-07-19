"use client";

import type { CSSProperties } from "react";
import { SKILL_MAP } from "@/data/skills";
import type { LevelChoice } from "@/game/types";

interface Props {
  level: number;
  choices: LevelChoice[];
  onChoose: (index: number) => void;
}

export function LevelUpModal({ level, choices, onChoose }: Props) {
  return (
    <div className="overlay animate-fade-in">
      <div className="panel panel-levelup animate-scale-in">
        <p className="eyebrow">Presence grows</p>
        <h2 className="panel-title">Level {level}</h2>
        <p className="panel-sub">Choose a communication technique</p>
        <div className="choice-list">
          {choices.map((c, i) => {
            const color =
              c.type === "skill" && c.skillId
                ? SKILL_MAP[c.skillId].color
                : "#F0B429";
            return (
              <button
                key={`${c.type}-${c.skillId ?? c.upgradeId}-${i}`}
                type="button"
                className="choice-card"
                style={{ "--choice-accent": color } as CSSProperties}
                onClick={() => onChoose(i)}
              >
                <span className="choice-kind">
                  {c.type === "skill" ? "Skill" : "Upgrade"}
                </span>
                <span className="choice-title">{c.title}</span>
                <span className="choice-desc">{c.description}</span>
                <span className="choice-detail">{c.detail}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
