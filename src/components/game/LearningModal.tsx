"use client";

import { useMemo, useState } from "react";
import { SCENARIOS } from "@/data/scenarios";
import { UPGRADE_MAP } from "@/data/upgrades";
import type { DisciplineId, UpgradeId } from "@/game/types";

interface Props {
  wave: number;
  unlockedDisciplines: DisciplineId[];
  onComplete: (correct: boolean, upgradeId?: UpgradeId, scenarioId?: string) => void;
}

export function LearningModal({ wave, unlockedDisciplines, onComplete }: Props) {
  const scenario = useMemo(() => {
    const pool = SCENARIOS.filter((s) =>
      unlockedDisciplines.includes(s.discipline),
    );
    const list = pool.length ? pool : SCENARIOS;
    return list[(wave - 1) % list.length]!;
  }, [wave, unlockedDisciplines]);

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const chosen = scenario.choices.find((c) => c.id === selected);
  const correct = !!chosen?.correct;

  return (
    <div className="overlay animate-fade-in">
      <div className="panel panel-learn animate-scale-in">
        <p className="eyebrow">Between waves · Learn</p>
        <h2 className="panel-title">Read the room</h2>
        <blockquote className="scenario-quote">
          <span className="scenario-speaker">{scenario.speaker}</span>
          <p>“{scenario.prompt}”</p>
        </blockquote>

        <div className="choice-list">
          {scenario.choices.map((c) => {
            let state = "";
            if (revealed && selected === c.id) {
              state = c.correct ? "is-correct" : "is-wrong";
            } else if (revealed && c.correct) {
              state = "is-correct";
            } else if (selected === c.id) {
              state = "is-selected";
            }
            return (
              <button
                key={c.id}
                type="button"
                className={`choice-card ${state}`}
                disabled={revealed}
                onClick={() => setSelected(c.id)}
              >
                <span className="choice-kind">{c.id.toUpperCase()}</span>
                <span className="choice-title">{c.text}</span>
              </button>
            );
          })}
        </div>

        {!revealed ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected}
            onClick={() => setRevealed(true)}
          >
            Lock in response
          </button>
        ) : (
          <div className="learn-result animate-fade-up">
            <p className={correct ? "result-good" : "result-bad"}>
              {correct
                ? "Strong response — upgrade unlocked."
                : "Not ideal — here’s the better move."}
            </p>
            <p className="learn-explain">{scenario.explanation}</p>
            {correct && (
              <p className="learn-reward">
                Reward: {UPGRADE_MAP[scenario.rewardUpgrade].name}
              </p>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                onComplete(
                  correct,
                  correct ? scenario.rewardUpgrade : undefined,
                  correct ? scenario.id : undefined,
                )
              }
            >
              Next wave
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
