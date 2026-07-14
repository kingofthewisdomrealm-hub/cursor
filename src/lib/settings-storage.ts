import { DEFAULT_AGENT_SETTINGS, SETTINGS_STORAGE_KEY } from "@/lib/agent-defaults";
import type { AgentSettings, AgentVoice, MaxResponseLength } from "@/types/agent";
import { VOICE_OPTIONS, MAX_RESPONSE_LENGTH_OPTIONS } from "@/types/agent";

function isVoice(value: unknown): value is AgentVoice {
  return (
    typeof value === "string" &&
    VOICE_OPTIONS.some((option) => option.value === value)
  );
}

function isMaxLength(value: unknown): value is MaxResponseLength {
  return (
    typeof value === "string" &&
    MAX_RESPONSE_LENGTH_OPTIONS.some((option) => option.value === value)
  );
}

export function loadAgentSettings(): AgentSettings {
  if (typeof window === "undefined") {
    return DEFAULT_AGENT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_AGENT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<AgentSettings>;
    return {
      name:
        typeof parsed.name === "string" && parsed.name.trim()
          ? parsed.name.trim()
          : DEFAULT_AGENT_SETTINGS.name,
      description:
        typeof parsed.description === "string" && parsed.description.trim()
          ? parsed.description.trim()
          : DEFAULT_AGENT_SETTINGS.description,
      instructions:
        typeof parsed.instructions === "string" && parsed.instructions.trim()
          ? parsed.instructions
          : DEFAULT_AGENT_SETTINGS.instructions,
      openingGreeting:
        typeof parsed.openingGreeting === "string" &&
        parsed.openingGreeting.trim()
          ? parsed.openingGreeting.trim()
          : DEFAULT_AGENT_SETTINGS.openingGreeting,
      voice: isVoice(parsed.voice)
        ? parsed.voice
        : DEFAULT_AGENT_SETTINGS.voice,
      speakingSpeed:
        typeof parsed.speakingSpeed === "number" &&
        parsed.speakingSpeed >= 0.5 &&
        parsed.speakingSpeed <= 1.5
          ? parsed.speakingSpeed
          : DEFAULT_AGENT_SETTINGS.speakingSpeed,
      maxResponseLength: isMaxLength(parsed.maxResponseLength)
        ? parsed.maxResponseLength
        : DEFAULT_AGENT_SETTINGS.maxResponseLength,
    };
  } catch {
    return DEFAULT_AGENT_SETTINGS;
  }
}

export function saveAgentSettings(settings: AgentSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
