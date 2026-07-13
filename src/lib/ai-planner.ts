import OpenAI from "openai";
import type { DailyBriefing, MissionPlan } from "@/types/mission";

const SYSTEM_PROMPT = `You are Outcome Agent, an intelligent project manager that converts vague outcomes into executable missions.

RULES:
- Never produce giant reports. Always prioritize: "What is the next best action?"
- Break outcomes into practical stages and daily-sized tasks.
- Actions that affect the outside world (sending messages, spending money, purchases) must have approval_required: true.
- Never recommend automatic spending, purchases, or accessing financial accounts.
- Keep clarifying questions to 3-5 essential questions only.
- Tasks must be specific, actionable, and include suggested messages/content when relevant.
- Return ONLY valid JSON matching the schema. No markdown.`;

const PLAN_SCHEMA = `{
  "mission_title": "string",
  "mission_summary": "string",
  "target": number,
  "deadline": "YYYY-MM-DD",
  "assumptions": ["string"],
  "clarifying_questions": ["string"],
  "strategy": "string (2-3 sentences)",
  "required_resources": ["string"],
  "stages": [{ "title": "string", "description": "string" }],
  "tasks": [{
    "title": "string",
    "description": "string",
    "reason": "string",
    "instructions": "string",
    "suggested_content": "string or null",
    "expected_result": "string",
    "estimated_impact": "string (e.g. High, Medium, Low — with brief reason)",
    "status": "not_started",
    "approval_required": boolean,
    "stage_index": number
  }],
  "approval_required": ["string — actions needing user sign-off"],
  "success_metrics": ["string"],
  "next_best_action": "string — the single most important action right now"
}`;

function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith("sk-your")) return null;
  return new OpenAI({ apiKey: key });
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export function generateDemoPlan(outcome: string, answers?: Record<string, string>): MissionPlan {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  const isSeminar =
    outcome.toLowerCase().includes("seminar") ||
    outcome.toLowerCase().includes("event") ||
    outcome.toLowerCase().includes("fill");

  if (isSeminar) {
    return {
      mission_title: "Fill The Sifting Method Seminar",
      mission_summary:
        "Drive 30 qualified registrations through targeted outreach, partnerships, and follow-up.",
      target: 30,
      deadline: deadline.toISOString().split("T")[0],
      assumptions: [
        "Seminar has a clear value proposition for attendees",
        "You can dedicate 1-2 hours daily to outreach",
        answers?.deadline ? `Deadline: ${answers.deadline}` : "30-day timeline assumed",
      ],
      clarifying_questions: [],
      strategy:
        "Focus on high-intent communities first (Toastmasters, business groups), then expand through partner co-promotion. Track conversion by channel and double down on what works.",
      required_resources: [
        "Registration landing page",
        "Email list or CRM",
        "Social media accounts",
        "Partner contact list",
      ],
      stages: [
        { title: "Define the audience", description: "Clarify ideal attendee profile" },
        { title: "Build the offer", description: "Craft compelling invitation" },
        { title: "Find communities", description: "Identify high-intent groups" },
        { title: "Create outreach messages", description: "Write personalized templates" },
        { title: "Contact potential partners", description: "Reach partner organizations" },
        { title: "Track replies", description: "Log responses and objections" },
        { title: "Follow up", description: "Persistent follow-up sequence" },
        { title: "Confirm attendees", description: "Secure registrations" },
      ],
      tasks: [
        {
          title: "Define your ideal attendee profile",
          description: "Document who benefits most from this seminar",
          reason: "Targeted outreach converts 3-5x better than generic blasts",
          instructions:
            "Write 3 bullet points: their role, their pain point, and what they'll gain from attending.",
          expected_result: "One-paragraph ideal attendee profile",
          estimated_impact: "High — foundation for all outreach",
          status: "ready",
          approval_required: false,
          stage_index: 0,
        },
        {
          title: "Contact five local Toastmasters clubs",
          description: "Reach clubs with members interested in communication",
          reason:
            "These groups already contain people interested in communication and public speaking.",
          instructions:
            "Find clubs on toastmasters.org. Email club presidents with a personalized invitation.",
          suggested_content:
            "Hi, I'm hosting a live seminar called The Sifting Method focused on [topic]. Would you be open to sharing this with members who want to improve their communication skills? Happy to offer a group discount.",
          expected_result: "5 outreach emails sent, 2+ positive replies",
          estimated_impact: "High — warm audience with shared interests",
          status: "not_started",
          approval_required: true,
          stage_index: 4,
        },
        {
          title: "Publish one invitation post on LinkedIn",
          description: "Share seminar details with your network",
          reason: "Organic reach from your network often drives early registrations",
          instructions:
            "Post a 150-word invitation with clear CTA, date, and registration link.",
          suggested_content:
            "I'm hosting The Sifting Method — a live seminar for [audience] who want to [outcome]. [Date] | [Location/Online]. Only 30 spots. Register here: [link]",
          expected_result: "1 post published, 50+ impressions",
          estimated_impact: "Medium — builds awareness in your network",
          status: "not_started",
          approval_required: true,
          stage_index: 3,
        },
        {
          title: "Follow up with eight warm contacts",
          description: "Personal outreach to people who've shown interest before",
          reason: "Warm leads convert at 15-25% vs 2-4% for cold outreach",
          instructions:
            "List 8 people who fit your ideal attendee. Send personal DMs or emails today.",
          suggested_content:
            "Hey [Name], I'm running a seminar on [topic] and immediately thought of you. Would love to have you there — can I send details?",
          expected_result: "8 messages sent, 2+ registrations",
          estimated_impact: "High — fastest path to early registrations",
          status: "not_started",
          approval_required: true,
          stage_index: 6,
        },
        {
          title: "Set up registration tracking spreadsheet",
          description: "Track sources, replies, and conversions",
          reason: "You can't optimize what you don't measure",
          instructions:
            "Create columns: Source, Contacted, Replied, Registered, Objection, Notes.",
          expected_result: "Tracking sheet ready with first entries",
          estimated_impact: "Medium — enables learning loop",
          status: "not_started",
          approval_required: false,
          stage_index: 5,
        },
      ],
      approval_required: [
        "Sending outreach messages",
        "Publishing social posts",
        "Contacting partner organizations",
      ],
      success_metrics: [
        "30 confirmed registrations",
        "15%+ reply rate on outreach",
        "3+ partner organizations promoting",
      ],
      next_best_action: "Contact five local Toastmasters clubs",
    };
  }

  return {
    mission_title: outcome.slice(0, 60),
    mission_summary: `Execute a focused plan to achieve: ${outcome}`,
    target: 10,
    deadline: deadline.toISOString().split("T")[0],
    assumptions: ["30-day timeline", "1-2 hours daily available"],
    clarifying_questions: [],
    strategy:
      "Break the outcome into measurable milestones. Start with research, then outreach, then follow-up. Prioritize high-conversion channels.",
    required_resources: ["Contact list", "Tracking system", "Outreach templates"],
    stages: [
      { title: "Research & prepare", description: "Understand the landscape" },
      { title: "Build assets", description: "Create messages and materials" },
      { title: "Execute outreach", description: "Contact targets systematically" },
      { title: "Follow up & close", description: "Convert interest to results" },
    ],
    tasks: [
      {
        title: "Define success criteria",
        description: "Clarify exactly what 'done' looks like",
        reason: "Clear targets drive focused action",
        instructions: "Write your target number, deadline, and quality bar.",
        expected_result: "Documented success criteria",
        estimated_impact: "High",
        status: "ready",
        approval_required: false,
        stage_index: 0,
      },
      {
        title: "Research top 10 targets",
        description: "Identify your highest-probability prospects",
        reason: "Focused lists outperform spray-and-pray",
        instructions: "List 10 specific people or organizations to contact first.",
        expected_result: "Prioritized prospect list",
        estimated_impact: "High",
        status: "not_started",
        approval_required: false,
        stage_index: 0,
      },
      {
        title: "Draft outreach message template",
        description: "Create a compelling first-touch message",
        reason: "Good templates save time and improve consistency",
        instructions: "Write a 3-sentence intro, value prop, and clear ask.",
        suggested_content: `Hi [Name], I'm working on ${outcome}. I thought you'd be a great fit because [reason]. Would you be open to [specific ask]?`,
        expected_result: "Reusable outreach template",
        estimated_impact: "Medium",
        status: "not_started",
        approval_required: false,
        stage_index: 1,
      },
      {
        title: "Send first 5 outreach messages",
        description: "Start executing with your top prospects",
        reason: "Action beats planning — early feedback improves the plan",
        instructions: "Personalize and send to your top 5 targets today.",
        expected_result: "5 messages sent",
        estimated_impact: "High",
        status: "not_started",
        approval_required: true,
        stage_index: 2,
      },
    ],
    approval_required: ["Sending outreach messages", "Publishing content"],
    success_metrics: ["Target number achieved", "10%+ conversion rate"],
    next_best_action: "Define success criteria and research top 10 targets",
  };
}

export function generateDemoQuestions(outcome: string): string[] {
  const lower = outcome.toLowerCase();
  const questions: string[] = ["What is your deadline?"];

  if (lower.includes("seminar") || lower.includes("event")) {
    questions.push("Is this online or in person?");
    questions.push("What city is it in?");
    questions.push("Who is the ideal attendee?");
  } else if (lower.includes("podcast")) {
    questions.push("What is your podcast topic/niche?");
    questions.push("How many episodes per month do you publish?");
  } else if (lower.includes("lead")) {
    questions.push("What geography do you serve?");
    questions.push("What makes a lead 'qualified' for you?");
  } else {
    questions.push("What resources do you already have?");
    questions.push("What actions require your approval?");
  }

  return questions.slice(0, 5);
}

export async function generateClarifyingQuestions(outcome: string): Promise<string[]> {
  const openai = getOpenAI();
  if (!openai) return generateDemoQuestions(outcome);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Outcome: "${outcome}"\n\nReturn JSON: { "questions": ["string"] }\nAsk only 3-5 essential clarifying questions. No markdown.`,
      },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return generateDemoQuestions(outcome);

  const parsed = parseJson<{ questions: string[] }>(content);
  return parsed.questions.slice(0, 5);
}

export async function generateMissionPlan(
  outcome: string,
  answers: Record<string, string>
): Promise<MissionPlan> {
  const openai = getOpenAI();
  if (!openai) return generateDemoPlan(outcome, answers);

  const answerText = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Outcome: "${outcome}"\n\nClarifications:\n${answerText}\n\nGenerate a mission plan. Schema:\n${PLAN_SCHEMA}\n\nInclude 5-10 tasks across stages. First task status should be "ready". Return JSON only.`,
      },
    ],
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return generateDemoPlan(outcome, answers);

  return parseJson<MissionPlan>(content);
}

export async function generateLearningUpdate(
  outcome: string,
  results: { channel: string; responses: number; yes: number; registrations: number }[]
): Promise<string> {
  const openai = getOpenAI();
  if (!openai) {
    const best = results.reduce((a, b) =>
      b.registrations / Math.max(b.responses, 1) > a.registrations / Math.max(a.responses, 1)
        ? b
        : a
    );
    const bestRate = ((best.registrations / Math.max(best.responses, 1)) * 100).toFixed(0);
    return `${best.channel} is converting at ${bestRate}%. The mission plan has been adjusted to prioritize ${best.channel.toLowerCase()}.`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Mission: "${outcome}"\nResults: ${JSON.stringify(results)}\n\nWrite 1-2 sentences on what to prioritize next based on conversion data. Be specific with percentages.`,
      },
    ],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content ?? "Strategy updated based on your results.";
}

export function generateDemoBriefing(): DailyBriefing {
  return {
    todays_mission: [
      "Contact five podcast hosts",
      "Publish one invitation post",
      "Follow up with eight people",
      "Confirm two attendees",
    ],
    target_for_today: "Three new registrations",
    agent_recommendation:
      "Focus on partnerships instead of individual outreach because partner invitations are producing more registrations.",
  };
}

export async function generateDailyBriefing(
  missionTitle: string,
  tasks: { title: string; status: string }[],
  progress: number,
  target: number
): Promise<DailyBriefing> {
  const openai = getOpenAI();
  if (!openai) return generateDemoBriefing();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Mission: "${missionTitle}"\nProgress: ${progress}/${target}\nTasks: ${JSON.stringify(tasks)}\n\nReturn JSON: { "todays_mission": ["string"], "target_for_today": "string", "agent_recommendation": "string" }`,
      },
    ],
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return generateDemoBriefing();

  return parseJson<DailyBriefing>(content);
}
