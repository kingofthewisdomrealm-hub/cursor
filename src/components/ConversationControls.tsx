"use client";

import { Mic, MicOff, PhoneOff, Play } from "lucide-react";
import type { ConnectionStatus } from "@/types/agent";

export function ConversationControls({
  status,
  isMuted,
  isLive,
  onStart,
  onMuteToggle,
  onEnd,
}: {
  status: ConnectionStatus;
  isMuted: boolean;
  isLive: boolean;
  onStart: () => void;
  onMuteToggle: () => void;
  onEnd: () => void;
}) {
  const startLabel =
    status === "error" || status === "disconnected"
      ? "Start New Conversation"
      : "Start Conversation";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {!isLive ? (
        <button type="button" onClick={onStart} className="btn-primary">
          <Play className="h-4 w-4" aria-hidden="true" />
          {startLabel}
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onMuteToggle}
            className="btn-secondary"
            disabled={status === "connecting"}
          >
            {isMuted ? (
              <>
                <Mic className="h-4 w-4" aria-hidden="true" />
                Unmute Microphone
              </>
            ) : (
              <>
                <MicOff className="h-4 w-4" aria-hidden="true" />
                Mute Microphone
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="btn-danger"
            disabled={status === "connecting"}
          >
            <PhoneOff className="h-4 w-4" aria-hidden="true" />
            End Conversation
          </button>
        </>
      )}
    </div>
  );
}
