export type ConnectionStatus =
  | "ready"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "disconnected"
  | "error";

export type AgentVoice =
  | "alloy"
  | "ash"
  | "ballad"
  | "coral"
  | "echo"
  | "marin"
  | "sage"
  | "shimmer"
  | "verse";

export type MaxResponseLength = "short" | "medium" | "long";

export interface AgentSettings {
  name: string;
  description: string;
  instructions: string;
  openingGreeting: string;
  voice: AgentVoice;
  speakingSpeed: number;
  maxResponseLength: MaxResponseLength;
}

export interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  status: "in_progress" | "completed" | "incomplete";
}

export const VOICE_OPTIONS: { value: AgentVoice; label: string }[] = [
  { value: "marin", label: "Marin" },
  { value: "alloy", label: "Alloy" },
  { value: "ash", label: "Ash" },
  { value: "ballad", label: "Ballad" },
  { value: "coral", label: "Coral" },
  { value: "echo", label: "Echo" },
  { value: "sage", label: "Sage" },
  { value: "shimmer", label: "Shimmer" },
  { value: "verse", label: "Verse" },
];

export const MAX_RESPONSE_LENGTH_OPTIONS: {
  value: MaxResponseLength;
  label: string;
  guidance: string;
}[] = [
  {
    value: "short",
    label: "Short",
    guidance: "Keep every spoken reply to 1–2 sentences.",
  },
  {
    value: "medium",
    label: "Medium",
    guidance: "Keep every spoken reply to 2–4 sentences.",
  },
  {
    value: "long",
    label: "Long",
    guidance: "You may speak in fuller paragraphs up to about 6 sentences.",
  },
];
