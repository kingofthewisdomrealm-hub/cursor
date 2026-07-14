import {
  MAX_RESPONSE_LENGTH_OPTIONS,
  type AgentSettings,
} from "@/types/agent";

export function buildAgentInstructions(settings: AgentSettings): string {
  const lengthGuidance =
    MAX_RESPONSE_LENGTH_OPTIONS.find(
      (option) => option.value === settings.maxResponseLength,
    )?.guidance ?? MAX_RESPONSE_LENGTH_OPTIONS[0].guidance;

  return `${settings.instructions.trim()}

Response length guidance:
${lengthGuidance}

Opening behavior:
When the conversation begins, speak this exact greeting first (do not paraphrase):
"${settings.openingGreeting.trim()}"

After that greeting, wait for the user and continue coaching from their answer.
If you receive a message that starts with [SESSION_START], treat it as a silent cue to deliver the opening greeting immediately. Do not mention the cue.`;
}
