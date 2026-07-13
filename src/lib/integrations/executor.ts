import OpenAI from "openai";
import type {
  ConnectedIntegration,
  IntegrationCapability,
  WorkRequest,
  WorkResult,
} from "@/types/integration";
import { getAppById } from "./registry";

function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith("sk-your")) return null;
  return new OpenAI({ apiKey: key });
}

const CAPABILITY_PROMPTS: Record<IntegrationCapability, string> = {
  research:
    "You are Research Scout. Produce actionable research: audiences, communities, partners, and channels. Be specific with names and places when possible.",
  outreach_writing:
    "You are Outreach Composer. Write ready-to-send outreach that is personal, concise, and includes a clear call to action.",
  prospect_list:
    "You are Prospect Mapper. Produce a numbered list of specific prospects with why each fits and a priority score (High/Medium/Low).",
  social_content:
    "You are Social Pulse. Write publish-ready social posts optimized for engagement.",
  strategy_analysis:
    "You are a strategy analyst. Provide clear recommendations, metrics to track, and next steps.",
  general_execution:
    "You are a mission execution agent. Complete the task with concrete, actionable output.",
  webhook:
    "Execute the delegated task and return structured output.",
};

function demoOutput(request: WorkRequest, appName: string): WorkResult {
  const { task, capability } = request;

  const outputs: Record<IntegrationCapability, string> = {
    research: `## Research Brief: ${task.title}

**Top channels to prioritize:**
1. Local Toastmasters clubs — members actively seek communication training
2. Business networking groups (BNI, Chamber of Commerce)
3. LinkedIn groups for your target audience

**Ideal attendee signals:** Professionals who present regularly, coaches, consultants

**Next step:** Contact 5 club presidents this week with a group discount offer.`,

    outreach_writing: `Subject: Invitation — ${request.mission_title}

Hi [Name],

I'm hosting ${request.mission_title} and thought of you immediately. It's designed for [audience] who want to [outcome].

Would you be open to sharing this with your members? Happy to offer a group rate.

Best,
[Your name]`,

    prospect_list: `## Prospect List (10 targets)

| # | Organization | Why | Priority |
|---|-------------|-----|----------|
| 1 | Downtown Toastmasters | Public speaking focus | High |
| 2 | Local BNI Chapter | Business owners | High |
| 3 | Chamber of Commerce | Community reach | Medium |
| 4 | LinkedIn: [Industry] Leaders Group | Target audience | Medium |
| 5 | Regional coaching association | Ideal attendees | High |`,

    social_content: `🎯 ${request.mission_title}

I'm hosting a live session for [audience] who want to [outcome].

📅 [Date] | 📍 [Location/Online]
🎟️ Only [X] spots — link in comments

Who should I invite? Tag someone who needs this. 👇`,

    strategy_analysis: `## Strategy Analysis

**What's working:** Partner outreach converts 3-4x better than cold DMs
**Focus this week:** 60% partnerships, 30% warm outreach, 10% social
**Track:** Source, contacted, replied, registered per channel`,

    general_execution: `## Completed: ${task.title}

${task.instructions}

**Deliverable:** ${task.expected_result ?? "Task output ready for review."}

**Suggested next action:** Review output, approve if ready, then move to outreach.`,

    webhook: `Webhook execution simulated. Configure your endpoint to receive real payloads.`,
  };

  return {
    success: true,
    output: outputs[capability] ?? outputs.general_execution,
    summary: `${appName} completed "${task.title}"`,
    requires_approval: request.task.title.toLowerCase().includes("contact") ||
      request.task.title.toLowerCase().includes("send") ||
      request.task.title.toLowerCase().includes("publish"),
  };
}

async function executeWithOpenAI(
  request: WorkRequest,
  integration: ConnectedIntegration
): Promise<WorkResult> {
  const openai = getOpenAI();
  const app = getAppById(integration.app_id);
  const appName = app?.name ?? integration.name;

  if (!openai) return demoOutput(request, appName);

  const system = CAPABILITY_PROMPTS[request.capability];
  const user = `Mission: ${request.mission_title}
Outcome: ${request.outcome_text}
Task: ${request.task.title}
Instructions: ${request.task.instructions ?? ""}
Expected result: ${request.task.expected_result ?? ""}
${request.task.suggested_content ? `Draft to improve:\n${request.task.suggested_content}` : ""}

Return practical output the user can act on immediately. No giant reports.`;

  try {
    const response = await openai.chat.completions.create({
      model: integration.config.model ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.5,
    });

    const output = response.choices[0]?.message?.content ?? "";
    if (!output) return demoOutput(request, appName);

    return {
      success: true,
      output,
      summary: `${appName} completed "${request.task.title}"`,
      requires_approval:
        app?.requires_approval ??
        integration.capabilities.includes("outreach_writing"),
    };
  } catch (err) {
    return {
      success: false,
      output: "",
      summary: "Execution failed",
      requires_approval: false,
      error: err instanceof Error ? err.message : "OpenAI request failed",
    };
  }
}

async function executeWithWebhook(
  request: WorkRequest,
  integration: ConnectedIntegration
): Promise<WorkResult> {
  const url = integration.config.webhook_url;
  if (!url) {
    return {
      success: false,
      output: "",
      summary: "Webhook not configured",
      requires_approval: false,
      error: "Add a webhook URL in Integrations settings",
    };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...integration.config.custom_headers,
    };
    if (integration.config.api_key) {
      headers.Authorization = `Bearer ${integration.config.api_key}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: "task.execute",
        mission_id: request.mission_id,
        task_id: request.task_id,
        capability: request.capability,
        mission_title: request.mission_title,
        outcome: request.outcome_text,
        task: request.task,
        context: request.context ?? {},
      }),
    });

    const data = await res.json().catch(() => ({}));
    const output =
      (data as { output?: string }).output ??
      (data as { result?: string }).result ??
      JSON.stringify(data, null, 2);

    return {
      success: res.ok,
      output,
      summary: res.ok
        ? `Webhook ${integration.name} returned results`
        : `Webhook failed (${res.status})`,
      requires_approval: true,
      metadata: { status: res.status },
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      success: false,
      output: "",
      summary: "Webhook request failed",
      requires_approval: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export async function executeWork(
  request: WorkRequest,
  integration: ConnectedIntegration
): Promise<WorkResult> {
  const app = getAppById(integration.app_id);

  if (integration.connector_type === "webhook" || integration.app_id === "custom-webhook") {
    return executeWithWebhook(request, integration);
  }

  if (
    integration.connector_type === "openai" ||
    integration.connector_type === "builtin" ||
    app?.connector_type === "openai" ||
    app?.connector_type === "builtin"
  ) {
    return executeWithOpenAI(request, integration);
  }

  return demoOutput(request, integration.name);
}
