"use client";

import { useState } from "react";

const STEPS = [
  {
    eyebrow: "How to move",
    title: "Stay present",
    body: "Drag the joystick (or use WASD / arrows). Keep composure by not letting obstacles overwhelm you.",
    visual: "🕹️",
  },
  {
    eyebrow: "How you respond",
    title: "Skills fire for you",
    body: "Unlocked communication skills auto-engage nearby challenges. You don’t tap to shoot — you position and choose upgrades.",
    visual: "🗣️",
  },
  {
    eyebrow: "How you grow",
    title: "Transform, then learn",
    body: "Obstacles become understood, engaged, convinced. Collect Confidence, level up, then pick the best real-world response between waves.",
    visual: "😠→😊",
  },
] as const;

interface Props {
  onDone: () => void;
}

export function OnboardingModal({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;

  return (
    <div className="overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="onboard-title">
      <div className="panel panel-onboard animate-scale-in">
        <p className="eyebrow">{current.eyebrow}</p>
        <div className="onboard-visual" aria-hidden>
          {current.visual}
        </div>
        <h2 id="onboard-title" className="panel-title">
          {current.title}
        </h2>
        <p className="panel-sub">{current.body}</p>

        <div className="onboard-dots" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onboard-dot ${i === step ? "is-active" : ""}`}
            />
          ))}
        </div>

        <div className="panel-actions">
          {!last ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={onDone}>
                Skip
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onDone}>
              Enter the conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
