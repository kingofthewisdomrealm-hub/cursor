import type { IntegrationCapability } from "@/types/integration";
import type { ConnectedIntegration } from "@/types/integration";
import type { Task } from "@/types/mission";
import { INTEGRATION_APPS } from "./registry";

export function getEnabledIntegrationsFromList(
  integrations: ConnectedIntegration[]
): ConnectedIntegration[] {
  return integrations.filter((i) => i.enabled);
}


const TASK_KEYWORDS: Record<IntegrationCapability, string[]> = {
  research: [
    "research",
    "find communities",
    "identify",
    "define",
    "audience",
    "map",
    "discover",
  ],
  outreach_writing: [
    "contact",
    "outreach",
    "email",
    "message",
    "follow up",
    "invite",
    "reach",
  ],
  prospect_list: [
    "list",
    "prospect",
    "targets",
    "clubs",
    "hosts",
    "organizations",
    "partners",
  ],
  social_content: [
    "post",
    "linkedin",
    "social",
    "publish",
    "announcement",
    "share",
  ],
  strategy_analysis: [
    "strategy",
    "track",
    "metric",
    "criteria",
    "plan",
    "spreadsheet",
  ],
  general_execution: [],
  webhook: [],
};

export function inferTaskCapability(task: Task): IntegrationCapability {
  if (task.suggested_capability) {
    return task.suggested_capability as IntegrationCapability;
  }

  const text = `${task.title} ${task.description ?? ""} ${task.instructions ?? ""}`.toLowerCase();

  const scores: Partial<Record<IntegrationCapability, number>> = {};
  for (const [cap, keywords] of Object.entries(TASK_KEYWORDS) as [
    IntegrationCapability,
    string[],
  ][]) {
    scores[cap] = keywords.filter((kw) => text.includes(kw)).length;
  }

  const best = Object.entries(scores).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
  if (best && (best[1] ?? 0) > 0) return best[0] as IntegrationCapability;

  return "general_execution";
}

export function matchIntegrationForTask(
  task: Task,
  integrations: ConnectedIntegration[],
  capability?: IntegrationCapability
) {
  const cap = capability ?? inferTaskCapability(task);
  const enabled = getEnabledIntegrationsFromList(integrations);

  const matches = enabled.filter((i) => i.capabilities.includes(cap));
  if (matches.length > 0) {
    return { integration: matches[0], capability: cap };
  }

  const fallback = enabled.find((i) => i.app_id === "openai-worker");
  if (fallback) return { integration: fallback, capability: cap };

  return null;
}

export function getAppsForCapability(capability: IntegrationCapability) {
  return INTEGRATION_APPS.filter((a) => a.capabilities.includes(capability));
}
