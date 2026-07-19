"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DISCIPLINES } from "@/data/disciplines";
import { ENVIRONMENTS } from "@/data/environments";
import { loadProgress, type ProgressState } from "@/lib/storage";

export function ProgressClient() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) {
    return (
      <main className="page">
        <p className="lead">Loading progress…</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header animate-fade-up">
        <Link href="/" className="btn btn-ghost" style={{ padding: "0.4rem 0.8rem" }}>
          ← Home
        </Link>
        <h1>Your influence</h1>
        <p>Unlock disciplines and rooms as you survive tougher conversations.</p>
      </div>

      <div className="stat-grid animate-fade-up">
        <div className="stat">
          <strong>{progress.bestWave}</strong>
          <span>Best wave</span>
        </div>
        <div className="stat">
          <strong>{progress.bestConfidence}</strong>
          <span>Best confidence</span>
        </div>
        <div className="stat">
          <strong>{progress.totalTransformed}</strong>
          <span>Interactions transformed</span>
        </div>
        <div className="stat">
          <strong>{progress.masteredScenarios.length}</strong>
          <span>Scenarios mastered</span>
        </div>
      </div>

      <section className="animate-fade-up" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
          Environments
        </h2>
        <p className="lead">Choose a social setting to enter.</p>
        <div className="env-grid">
          {ENVIRONMENTS.map((env) => {
            const unlocked = progress.unlockedEnvironments.includes(env.id);
            if (!unlocked) {
              return (
                <div key={env.id} className="env-card locked">
                  <h3>
                    <span className="env-accent" style={{ background: env.accent }} />
                    {env.name}
                  </h3>
                  <p>Unlock by reaching wave {env.unlockWave}</p>
                </div>
              );
            }
            return (
              <Link key={env.id} href={`/play?env=${env.id}`} className="env-card">
                <h3>
                  <span className="env-accent" style={{ background: env.accent }} />
                  {env.name}
                </h3>
                <p>{env.tagline}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="animate-fade-up">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
          Disciplines
        </h2>
        <p className="lead">Each path adds scenarios and a signature skill.</p>
        <div className="discipline-grid">
          {DISCIPLINES.map((d) => {
            const unlocked = progress.unlockedDisciplines.includes(d.id);
            return (
              <div
                key={d.id}
                className={`discipline-card ${unlocked ? "" : "locked"}`}
              >
                <h3>
                  {d.name}{" "}
                  {!unlocked && (
                    <span style={{ color: "var(--color-slate)", fontWeight: 500 }}>
                      · wave {d.unlockLevel}
                    </span>
                  )}
                </h3>
                <p>{d.description}</p>
              </div>
            );
          })}
        </div>
        <p className="hint">
          Tip: on desktop use WASD / arrows. On mobile, drag the joystick.
        </p>
      </section>
    </main>
  );
}
