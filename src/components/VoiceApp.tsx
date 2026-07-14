"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { ConversationControls } from "@/components/ConversationControls";
import { SettingsPanel } from "@/components/SettingsPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { VoiceOrb } from "@/components/VoiceOrb";
import { useAgentSettings } from "@/hooks/useAgentSettings";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";

export function VoiceApp() {
  const { settings, hydrated, updateSettings, resetSettings } =
    useAgentSettings();
  const {
    status,
    isMuted,
    isLive,
    errorMessage,
    transcript,
    startConversation,
    endConversation,
    toggleMute,
  } = useRealtimeVoice(settings);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleStart = () => {
    void startConversation();
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-sm text-[var(--muted)]">
        Loading agent…
      </div>
    );
  }

  return (
    <>
      <div className="page-shell">
        <header className="page-header">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Realtime voice MVP</p>
              <h1 className="font-display mt-2 text-4xl leading-none tracking-tight text-[var(--ink)] sm:text-5xl">
                {settings.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                {settings.description}
              </p>
            </div>
            <button
              type="button"
              className="icon-btn shrink-0"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open agent settings"
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <StatusBadge status={status} errorMessage={errorMessage} />
          </div>
        </header>

        <main className="page-main">
          <VoiceOrb status={status} isMuted={isMuted} />

          <div className="mt-8">
            <ConversationControls
              status={status}
              isMuted={isMuted}
              isLive={isLive}
              onStart={handleStart}
              onMuteToggle={toggleMute}
              onEnd={endConversation}
            />
          </div>

          <p className="mx-auto mt-5 max-w-md text-center text-sm text-[var(--muted)]">
            Uses your computer or phone mic over WebRTC. Interrupt naturally —
            the coach will stop and listen.
          </p>

          <div className="mt-10">
            <TranscriptPanel entries={transcript} />
          </div>
        </main>
      </div>

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        locked={isLive}
        onClose={() => setSettingsOpen(false)}
        onChange={updateSettings}
        onReset={resetSettings}
      />
    </>
  );
}
