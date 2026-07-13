import type { IntegrationApp } from "@/types/integration";

export const INTEGRATION_APPS: IntegrationApp[] = [
  {
    id: "openai-worker",
    name: "OpenAI Mission Worker",
    description:
      "General-purpose AI worker for research, drafting, and execution planning.",
    icon: "brain",
    capabilities: [
      "general_execution",
      "research",
      "strategy_analysis",
      "outreach_writing",
      "social_content",
      "prospect_list",
    ],
    connector_type: "openai",
    requires_approval: true,
    is_builtin: true,
  },
  {
    id: "research-scout",
    name: "Research Scout",
    description:
      "Finds communities, audiences, partners, and strategies for your mission.",
    icon: "search",
    capabilities: ["research", "strategy_analysis", "prospect_list"],
    connector_type: "builtin",
    requires_approval: false,
    is_builtin: true,
  },
  {
    id: "outreach-composer",
    name: "Outreach Composer",
    description:
      "Writes personalized emails, DMs, and partnership messages.",
    icon: "mail",
    capabilities: ["outreach_writing"],
    connector_type: "builtin",
    requires_approval: true,
    is_builtin: true,
  },
  {
    id: "prospect-mapper",
    name: "Prospect Mapper",
    description:
      "Builds ranked lists of people, organizations, and targets to contact.",
    icon: "users",
    capabilities: ["prospect_list", "research"],
    connector_type: "builtin",
    requires_approval: false,
    is_builtin: true,
  },
  {
    id: "social-pulse",
    name: "Social Pulse",
    description:
      "Creates social posts, invitations, and announcement copy.",
    icon: "share",
    capabilities: ["social_content", "outreach_writing"],
    connector_type: "builtin",
    requires_approval: true,
    is_builtin: true,
  },
  {
    id: "custom-webhook",
    name: "Custom AI App (Webhook)",
    description:
      "Connect any external AI agent via webhook — Zapier, Make, n8n, or your own API.",
    icon: "webhook",
    capabilities: ["webhook", "general_execution"],
    connector_type: "webhook",
    requires_approval: true,
    is_builtin: true,
    docs_url: "https://github.com/kingofthewisdomrealm-hub/cursor/blob/main/docs/integrations.md",
  },
];

export function getAppById(appId: string): IntegrationApp | undefined {
  return INTEGRATION_APPS.find((a) => a.id === appId);
}

export const CAPABILITY_LABELS: Record<string, string> = {
  research: "Research",
  outreach_writing: "Outreach Writing",
  prospect_list: "Prospect Lists",
  social_content: "Social Content",
  strategy_analysis: "Strategy",
  general_execution: "General Execution",
  webhook: "Webhook",
};
