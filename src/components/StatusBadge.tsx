"use client";

import type { ConnectionStatus } from "@/types/agent";

const STATUS_COPY: Record<
  ConnectionStatus,
  { label: string; detail: string }
> = {
  ready: {
    label: "Ready",
    detail: "Press Start Conversation when you want to practice.",
  },
  connecting: {
    label: "Connecting",
    detail: "Requesting microphone access and opening a secure session…",
  },
  listening: {
    label: "Listening",
    detail: "Speak naturally. You can interrupt the coach anytime.",
  },
  thinking: {
    label: "Thinking",
    detail: "Processing what you said…",
  },
  speaking: {
    label: "Speaking",
    detail: "Your coach is responding. Talk to interrupt.",
  },
  disconnected: {
    label: "Disconnected",
    detail: "Conversation ended. Start again whenever you are ready.",
  },
  error: {
    label: "Error",
    detail: "Something went wrong. Fix the issue below, then try again.",
  },
};

export function StatusBadge({
  status,
  errorMessage,
}: {
  status: ConnectionStatus;
  errorMessage?: string | null;
}) {
  const copy = STATUS_COPY[status];

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm">
        <span
          className={`status-dot status-dot--${status}`}
          aria-hidden="true"
        />
        <span className="font-medium text-[var(--ink)]">{copy.label}</span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        {status === "error" && errorMessage ? errorMessage : copy.detail}
      </p>
    </div>
  );
}
