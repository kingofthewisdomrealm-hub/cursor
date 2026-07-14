"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RealtimeAgent,
  RealtimeSession,
  type RealtimeItem,
} from "@openai/agents/realtime";
import { buildAgentInstructions } from "@/lib/build-instructions";
import { historyToTranscript } from "@/lib/transcript";
import type {
  AgentSettings,
  ConnectionStatus,
  TranscriptEntry,
} from "@/types/agent";

const REALTIME_MODEL = "gpt-realtime-2.1";

function mapMicrophoneError(error: unknown): string {
  if (!(error instanceof DOMException)) {
    return "Could not access the microphone. Check browser permissions and try again.";
  }

  switch (error.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Microphone permission was denied. Allow microphone access in your browser settings, then press Start Conversation again.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No microphone was found. Connect a mic or enable one on your device, then try again.";
    case "NotReadableError":
    case "TrackStartError":
      return "Your microphone is already in use by another app. Close that app and try again.";
    case "SecurityError":
      return "Microphone access is blocked on this page. Use HTTPS or localhost and allow microphone permission.";
    default:
      return error.message || "Microphone access failed. Please try again.";
  }
}

export function useRealtimeVoice(settings: AgentSettings) {
  const [status, setStatus] = useState<ConnectionStatus>("ready");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const sessionRef = useRef<RealtimeSession | null>(null);
  const settingsRef = useRef(settings);
  const connectingRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const cleanupSession = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (session) {
      try {
        session.close();
      } catch {
        // Session may already be closed.
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  const applyHistory = useCallback((history: RealtimeItem[]) => {
    setTranscript(historyToTranscript(history));
  }, []);

  const startConversation = useCallback(async () => {
    if (connectingRef.current || sessionRef.current) return;

    connectingRef.current = true;
    setErrorMessage(null);
    setTranscript([]);
    setIsMuted(false);
    setStatus("connecting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "This browser does not support microphone access. Try Chrome, Safari, or Edge on a secure connection.",
        );
      }

      // Request mic early so permission failures are clear before the API call.
      const previewStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      previewStream.getTracks().forEach((track) => track.stop());

      const activeSettings = settingsRef.current;

      const tokenResponse = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: activeSettings.voice }),
      });

      const tokenPayload = (await tokenResponse.json()) as {
        client_secret?: string;
        error?: string;
      };

      if (!tokenResponse.ok || !tokenPayload.client_secret) {
        throw new Error(
          tokenPayload.error ||
            "Could not create a secure Realtime session. Check the server OPENAI_API_KEY.",
        );
      }

      const agent = new RealtimeAgent({
        name: activeSettings.name,
        instructions: buildAgentInstructions(activeSettings),
        voice: activeSettings.voice,
      });

      const session = new RealtimeSession(agent, {
        model: REALTIME_MODEL,
        config: {
          outputModalities: ["audio"],
          audio: {
            input: {
              transcription: {
                model: "gpt-4o-mini-transcribe",
              },
              turnDetection: {
                type: "semantic_vad",
                eagerness: "medium",
                createResponse: true,
                interruptResponse: true,
              },
            },
            output: {
              voice: activeSettings.voice,
              speed: activeSettings.speakingSpeed,
            },
          },
        },
      });

      session.on("history_updated", (history) => {
        applyHistory(history);
      });

      session.on("audio_start", () => {
        setStatus("speaking");
      });

      session.on("audio_stopped", () => {
        setStatus((current) =>
          current === "disconnected" || current === "error"
            ? current
            : "listening",
        );
      });

      session.on("audio_interrupted", () => {
        setStatus("listening");
      });

      session.on("agent_start", () => {
        setStatus((current) =>
          current === "speaking" ? current : "thinking",
        );
      });

      session.on("error", (event) => {
        const message =
          event.error instanceof Error
            ? event.error.message
            : typeof event.error === "string"
              ? event.error
              : "The Realtime session hit an unexpected error.";
        setErrorMessage(message);
        setStatus("error");
      });

      session.on("transport_event", (event) => {
        const type = (event as { type?: string }).type;
        if (type === "input_audio_buffer.speech_started") {
          setStatus("listening");
        } else if (type === "input_audio_buffer.speech_stopped") {
          setStatus((current) =>
            current === "speaking" ? current : "thinking",
          );
        } else if (type === "response.created" || type === "response.output_item.added") {
          setStatus((current) =>
            current === "speaking" ? current : "thinking",
          );
        }
      });

      await session.connect({ apiKey: tokenPayload.client_secret });
      sessionRef.current = session;
      setStatus("listening");

      // Kick off the configured opening greeting.
      session.sendMessage(
        `[SESSION_START] Deliver your opening greeting now.`,
      );
    } catch (error) {
      cleanupSession();
      const message =
        error instanceof DOMException ||
        (error instanceof Error &&
          /Permission|microphone|NotAllowed|NotFound|NotReadable|SecurityError/i.test(
            error.name + error.message,
          ))
          ? mapMicrophoneError(error)
          : error instanceof Error
            ? error.message
            : "Failed to start the conversation.";
      setErrorMessage(message);
      setStatus("error");
    } finally {
      connectingRef.current = false;
    }
  }, [applyHistory, cleanupSession]);

  const endConversation = useCallback(() => {
    cleanupSession();
    setIsMuted(false);
    setStatus("disconnected");
  }, [cleanupSession]);

  const toggleMute = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const next = !isMuted;
    try {
      session.mute(next);
      setIsMuted(next);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not change microphone mute state.",
      );
    }
  }, [isMuted]);

  const resetToReady = useCallback(() => {
    cleanupSession();
    setErrorMessage(null);
    setIsMuted(false);
    setStatus("ready");
  }, [cleanupSession]);

  const isLive =
    status === "connecting" ||
    status === "listening" ||
    status === "thinking" ||
    status === "speaking";

  return {
    status,
    isMuted,
    isLive,
    errorMessage,
    transcript,
    startConversation,
    endConversation,
    toggleMute,
    resetToReady,
  };
}
