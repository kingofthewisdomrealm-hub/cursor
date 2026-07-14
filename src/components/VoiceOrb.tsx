"use client";

import type { ConnectionStatus } from "@/types/agent";

export function VoiceOrb({
  status,
  isMuted,
}: {
  status: ConnectionStatus;
  isMuted: boolean;
}) {
  const label =
    status === "ready"
      ? "Ready"
      : status === "connecting"
        ? "Connecting"
        : status === "listening"
          ? isMuted
            ? "Muted"
            : "Listening"
          : status === "thinking"
            ? "Thinking"
            : status === "speaking"
              ? "Speaking"
              : status === "error"
                ? "Error"
                : "Idle";

  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      <div className={`orb-ring orb-ring--${status}`} aria-hidden="true" />
      <div className={`orb-ring orb-ring--delay orb-ring--${status}`} aria-hidden="true" />
      <div
        className={`orb-core orb-core--${status} ${isMuted ? "orb-core--muted" : ""}`}
        role="img"
        aria-label={`Voice status: ${label}`}
      >
        <span className="orb-label">{label}</span>
      </div>
    </div>
  );
}
