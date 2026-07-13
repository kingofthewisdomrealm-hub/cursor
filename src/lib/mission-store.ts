import { v4 as uuidv4 } from "uuid";
import type {
  AgentRecommendation,
  MissionPlan,
  MissionQuestion,
  MissionStage,
  MissionWithRelations,
  Task,
  TaskResult,
  TaskStatus,
} from "@/types/mission";

const STORAGE_KEY = "outcome-agent-missions";

const TERMINAL_TASK_STATUSES: TaskStatus[] = ["completed", "skipped"];

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded or private browsing
  }
}

function now() {
  return new Date().toISOString();
}

function sortedTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.sort_order - b.sort_order);
}

function initialTaskStatus(
  index: number,
  approvalRequired: boolean
): TaskStatus {
  if (index === 0) {
    return approvalRequired ? "waiting_for_approval" : "ready";
  }
  return "not_started";
}

export function createLocalMission(
  outcomeText: string,
  id?: string
): MissionWithRelations {
  const missionId = id ?? uuidv4();
  const mission: MissionWithRelations = {
    id: missionId,
    outcome_text: outcomeText,
    status: "clarifying",
    current_progress: 0,
    created_at: now(),
    updated_at: now(),
    questions: [],
    stages: [],
    tasks: [],
    recommendations: [],
    task_results: [],
    cached_plan: null,
  };

  const store = readStore();
  store[missionId] = mission;
  writeStore(store);
  return mission;
}

export function getLocalMission(id: string): MissionWithRelations | null {
  return readStore()[id] ?? null;
}

export function updateLocalMission(
  id: string,
  updates: Partial<MissionWithRelations>
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
  questions: Array<{
    id?: string;
    question: string;
    answer?: string | null;
    sort_order?: number;
    required?: boolean;
  }>
): MissionQuestion[] {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return [];

  mission.questions = questions.map((q, i) => ({
    id: q.id ?? uuidv4(),
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

export function getAnswersFromMission(
  mission: MissionWithRelations
): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const q of mission.questions) {
    if (q.answer?.trim()) {
      answers[q.question] = q.answer.trim();
    }
  }
  return answers;
}

export function saveCachedPlan(missionId: string, plan: MissionPlan): void {
  updateLocalMission(missionId, { cached_plan: plan });
}

export function getCachedPlan(missionId: string): MissionPlan | null {
  return getLocalMission(missionId)?.cached_plan ?? null;
}

export function applyLocalPlan(
  missionId: string,
  plan: MissionPlan
): MissionWithRelations | null {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return null;

  if (mission.status === "active" && mission.tasks.length > 0) {
    return mission;
  }

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
    status: initialTaskStatus(i, t.approval_required),
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
    cached_plan: plan,
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

export function isTaskUnlocked(
  mission: MissionWithRelations,
  task: Task
): boolean {
  const ordered = sortedTasks(mission.tasks);
  const index = ordered.findIndex((t) => t.id === task.id);
  if (index <= 0) return true;

  return ordered
    .slice(0, index)
    .every((t) => TERMINAL_TASK_STATUSES.includes(t.status));
}

export function canCompleteTask(
  mission: MissionWithRelations,
  task: Task
): boolean {
  if (!isTaskUnlocked(mission, task)) return false;
  if (task.status === "not_started") return false;
  if (task.approval_required) {
    return task.status === "in_progress";
  }
  return ["ready", "in_progress"].includes(task.status);
}

export function canApproveTask(task: Task): boolean {
  return (
    task.approval_required && task.status === "waiting_for_approval"
  );
}

function updateStageProgress(mission: MissionWithRelations): void {
  for (const stage of mission.stages) {
    const stageTasks = mission.tasks.filter((t) => t.stage_id === stage.id);
    if (stageTasks.length === 0) continue;

    const allDone = stageTasks.every((t) =>
      TERMINAL_TASK_STATUSES.includes(t.status)
    );
    const anyStarted = stageTasks.some(
      (t) => !["not_started"].includes(t.status)
    );

    if (allDone) {
      stage.status = "completed";
    } else if (anyStarted) {
      stage.status = "active";
      mission.current_stage_id = stage.id;
    }
  }

  const nextActive = mission.stages.find((s) => s.status !== "completed");
  if (nextActive && nextActive.status === "pending") {
    nextActive.status = "active";
    mission.current_stage_id = nextActive.id;
  }
}

export function advanceAfterTask(
  missionId: string,
  completedTaskId: string
): MissionWithRelations | null {
  const store = readStore();
  const mission = store[missionId];
  if (!mission) return null;

  updateStageProgress(mission);

  const ordered = sortedTasks(mission.tasks);
  const completedIndex = ordered.findIndex((t) => t.id === completedTaskId);

  for (let i = completedIndex + 1; i < ordered.length; i++) {
    const next = ordered[i];
    if (TERMINAL_TASK_STATUSES.includes(next.status)) continue;

    const newStatus: TaskStatus = next.approval_required
      ? "waiting_for_approval"
      : "ready";

    const idx = mission.tasks.findIndex((t) => t.id === next.id);
    if (idx !== -1) {
      mission.tasks[idx] = {
        ...mission.tasks[idx],
        status: newStatus,
        updated_at: now(),
      };
    }
    break;
  }

  const nextTask = getNextTask(mission);
  if (nextTask) {
    const rec = mission.recommendations.find(
      (r) => r.recommendation_type === "next_action"
    );
    if (rec) {
      rec.content = nextTask.title;
    }
  }

  mission.updated_at = now();
  writeStore(store);
  return mission;
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
  const ordered = sortedTasks(mission.tasks);
  const priority: TaskStatus[] = [
    "in_progress",
    "ready",
    "waiting_for_approval",
  ];

  for (const status of priority) {
    const task = ordered.find(
      (t) => t.status === status && isTaskUnlocked(mission, t)
    );
    if (task) return task;
  }

  return (
    ordered.find(
      (t) =>
        t.status === "not_started" && isTaskUnlocked(mission, t)
    ) ?? null
  );
}

export function getCurrentStage(
  mission: MissionWithRelations
): MissionStage | null {
  if (mission.current_stage_id) {
    return mission.stages.find((s) => s.id === mission.current_stage_id) ?? null;
  }
  return (
    mission.stages.find((s) => s.status === "active") ??
    mission.stages[0] ??
    null
  );
}

export function getNextBestAction(mission: MissionWithRelations): string {
  const rec = mission.recommendations.find(
    (r) => r.recommendation_type === "next_action" && r.is_active
  );
  if (rec) return rec.content;

  const nextTask = getNextTask(mission);
  return nextTask?.title ?? "Review your mission plan and start the first task.";
}
