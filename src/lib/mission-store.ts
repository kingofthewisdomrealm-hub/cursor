import { v4 as uuidv4 } from "uuid";
import type {
  AgentRecommendation,
  Mission,
  MissionPlan,
  MissionQuestion,
  MissionStage,
  MissionWithRelations,
  Task,
  TaskResult,
  TaskStatus,
} from "@/types/mission";

const STORAGE_KEY = "outcome-agent-missions";

function readStore(): Record<string, MissionWithRelations> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, MissionWithRelations>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function now() {
  return new Date().toISOString();
}

export function createLocalMission(outcomeText: string): MissionWithRelations {
  const id = uuidv4();
  const mission: MissionWithRelations = {
    id,
    outcome_text: outcomeText,
    status: "draft",
    current_progress: 0,
    created_at: now(),
    updated_at: now(),
    questions: [],
    stages: [],
    tasks: [],
    recommendations: [],
    task_results: [],
  };

  const store = readStore();
  store[id] = mission;
  writeStore(store);
  return mission;
}

export function getLocalMission(id: string): MissionWithRelations | null {
  return readStore()[id] ?? null;
}

export function updateLocalMission(
  id: string,
  updates: Partial<Mission>
): MissionWithRelations | null {
  const store = readStore();
  const mission = store[id];
  if (!mission) return null;

  store[id] = {
    ...mission,
    ...updates,
    updated_at: now(),
  };
  writeStore(store);
  return store[id];
}

export function updateLocalQuestions(
  missionId: string,
  questions: MissionQuestion[]
): void {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return;

  mission.questions = questions;
  mission.updated_at = now();
  writeStore(store);
}

export function setLocalQuestions(
  missionId: string,
  questions: Omit<MissionQuestion, "id" | "mission_id" | "created_at">[]
): MissionQuestion[] {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return [];

  mission.questions = questions.map((q, i) => ({
    id: uuidv4(),
    mission_id: missionId,
    question: q.question,
    answer: q.answer ?? null,
    sort_order: q.sort_order ?? i,
    required: q.required ?? true,
    created_at: now(),
  }));
  mission.updated_at = now();
  writeStore(store);
  return mission.questions;
}

export function applyLocalPlan(missionId: string, plan: MissionPlan): MissionWithRelations | null {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return null;

  const stages: MissionStage[] = plan.stages.map((s, i) => ({
    id: uuidv4(),
    mission_id: missionId,
    title: s.title,
    description: s.description,
    sort_order: i,
    status: i === 0 ? "active" : "pending",
    created_at: now(),
  }));

  const tasks: Task[] = plan.tasks.map((t, i) => ({
    id: uuidv4(),
    mission_id: missionId,
    stage_id: stages[t.stage_index ?? 0]?.id ?? stages[0]?.id,
    title: t.title,
    description: t.description,
    reason: t.reason,
    instructions: t.instructions,
    suggested_content: t.suggested_content ?? null,
    expected_result: t.expected_result,
    estimated_impact: t.estimated_impact,
    status: i === 0 ? "ready" : (t.status ?? "not_started"),
    approval_required: t.approval_required,
    sort_order: i,
    created_at: now(),
    updated_at: now(),
  }));

  const recommendations: AgentRecommendation[] = [
    {
      id: uuidv4(),
      mission_id: missionId,
      recommendation_type: "next_action",
      title: "Next Best Action",
      content: plan.next_best_action,
      priority: 10,
      is_active: true,
      created_at: now(),
    },
    {
      id: uuidv4(),
      mission_id: missionId,
      recommendation_type: "strategy",
      title: "Strategy",
      content: plan.strategy,
      priority: 5,
      is_active: true,
      created_at: now(),
    },
  ];

  store[missionId] = {
    ...mission,
    mission_title: plan.mission_title,
    mission_summary: plan.mission_summary,
    target: plan.target,
    deadline: plan.deadline,
    strategy: plan.strategy,
    required_resources: plan.required_resources,
    assumptions: plan.assumptions,
    success_metrics: plan.success_metrics,
    approval_required: plan.approval_required,
    status: "active",
    current_stage_id: stages[0]?.id ?? null,
    stages,
    tasks,
    recommendations,
    updated_at: now(),
  };

  writeStore(store);
  return store[missionId];
}

export function updateLocalTask(
  missionId: string,
  taskId: string,
  updates: Partial<Task>
): Task | null {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return null;

  const idx = mission.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;

  mission.tasks[idx] = {
    ...mission.tasks[idx],
    ...updates,
    updated_at: now(),
  };
  mission.updated_at = now();
  writeStore(store);
  return mission.tasks[idx];
}

export function addLocalTaskResult(
  missionId: string,
  taskId: string,
  result: Omit<TaskResult, "id" | "mission_id" | "task_id" | "created_at">
): TaskResult | null {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return null;

  const entry: TaskResult = {
    id: uuidv4(),
    mission_id: missionId,
    task_id: taskId,
    ...result,
    created_at: now(),
  };

  mission.task_results.push(entry);
  mission.updated_at = now();
  writeStore(store);
  return entry;
}

export function addLocalRecommendation(
  missionId: string,
  rec: Omit<AgentRecommendation, "id" | "mission_id" | "created_at">
): AgentRecommendation | null {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return null;

  const entry: AgentRecommendation = {
    id: uuidv4(),
    mission_id: missionId,
    ...rec,
    created_at: now(),
  };

  mission.recommendations.unshift(entry);
  mission.updated_at = now();
  writeStore(store);
  return entry;
}

export function getNextTask(mission: MissionWithRelations): Task | null {
  const priority: TaskStatus[] = [
    "ready",
    "in_progress",
    "waiting_for_approval",
    "not_started",
  ];

  for (const status of priority) {
    const task = mission.tasks.find((t) => t.status === status);
    if (task) return task;
  }
  return null;
}

export function getCurrentStage(mission: MissionWithRelations): MissionStage | null {
  if (mission.current_stage_id) {
    return mission.stages.find((s) => s.id === mission.current_stage_id) ?? null;
  }
  return mission.stages.find((s) => s.status === "active") ?? mission.stages[0] ?? null;
}

export function getNextBestAction(mission: MissionWithRelations): string {
  const rec = mission.recommendations.find(
    (r) => r.recommendation_type === "next_action" && r.is_active
  );
  if (rec) return rec.content;

  const nextTask = getNextTask(mission);
  return nextTask?.title ?? "Review your mission plan and start the first task.";
}
