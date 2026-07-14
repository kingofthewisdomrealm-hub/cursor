"use client";

import { RotateCcw, Settings2, X } from "lucide-react";
import {
  MAX_RESPONSE_LENGTH_OPTIONS,
  VOICE_OPTIONS,
  type AgentSettings,
  type MaxResponseLength,
  type AgentVoice,
} from "@/types/agent";

export function SettingsPanel({
  open,
  settings,
  locked,
  onClose,
  onChange,
  onReset,
}: {
  open: boolean;
  settings: AgentSettings;
  locked: boolean;
  onClose: () => void;
  onChange: (next: AgentSettings) => void;
  onReset: () => void;
}) {
  if (!open) return null;

  const update = <K extends keyof AgentSettings>(
    key: K,
    value: AgentSettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Agent settings">
      <button
        type="button"
        className="settings-backdrop"
        aria-label="Close settings"
        onClick={onClose}
      />
      <div className="settings-sheet">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 text-[var(--accent)]">
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                Admin settings
              </span>
            </div>
            <h2 className="font-display text-2xl text-[var(--ink)]">
              Shape your agent
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Edits save in this browser. Changes apply the next time you start a conversation.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {locked ? (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950">
            End the current conversation before editing agent settings.
          </p>
        ) : null}

        <div className="space-y-4">
          <label className="field">
            <span>Agent name</span>
            <input
              value={settings.name}
              disabled={locked}
              onChange={(event) => update("name", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Agent description</span>
            <textarea
              rows={2}
              value={settings.description}
              disabled={locked}
              onChange={(event) => update("description", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Agent instructions</span>
            <textarea
              rows={8}
              value={settings.instructions}
              disabled={locked}
              onChange={(event) => update("instructions", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Opening greeting</span>
            <textarea
              rows={2}
              value={settings.openingGreeting}
              disabled={locked}
              onChange={(event) => update("openingGreeting", event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span>Voice</span>
              <select
                value={settings.voice}
                disabled={locked}
                onChange={(event) =>
                  update("voice", event.target.value as AgentVoice)
                }
              >
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.value} value={voice.value}>
                    {voice.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Maximum response length</span>
              <select
                value={settings.maxResponseLength}
                disabled={locked}
                onChange={(event) =>
                  update(
                    "maxResponseLength",
                    event.target.value as MaxResponseLength,
                  )
                }
              >
                {MAX_RESPONSE_LENGTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>
              Speaking speed{" "}
              <em className="not-italic text-[var(--muted)]">
                ({settings.speakingSpeed.toFixed(2)}x)
              </em>
            </span>
            <input
              type="range"
              min={0.75}
              max={1.25}
              step={0.05}
              value={settings.speakingSpeed}
              disabled={locked}
              onChange={(event) =>
                update("speakingSpeed", Number(event.target.value))
              }
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={locked}
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset defaults
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
