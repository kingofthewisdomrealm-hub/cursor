import type { RealtimeItem } from "@openai/agents/realtime";
import type { TranscriptEntry } from "@/types/agent";

function contentText(
  content: Array<{
    type: string;
    text?: string;
    transcript?: string | null;
  }>,
): string {
  return content
    .map((part) => {
      if (part.type === "input_text" || part.type === "output_text") {
        return part.text ?? "";
      }
      if (part.type === "input_audio" || part.type === "output_audio") {
        return part.transcript ?? "";
      }
      return "";
    })
    .join("")
    .trim();
}

export function historyToTranscript(history: RealtimeItem[]): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];

  for (const item of history) {
    if (item.type !== "message") continue;
    if (item.role !== "user" && item.role !== "assistant") continue;

    const text = contentText(
      item.content as Array<{
        type: string;
        text?: string;
        transcript?: string | null;
      }>,
    );

    // Skip silent placeholders and internal session kickoff cues.
    if (!text) continue;
    if (text.startsWith("[SESSION_START]")) continue;

    entries.push({
      id: item.itemId,
      role: item.role === "user" ? "user" : "agent",
      text,
      status: item.status,
    });
  }

  return entries;
}
