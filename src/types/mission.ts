export type MissionStatus =
  | "draft"
  | "clarifying"
  | "planning"
  | "active"
  | "completed"
  | "paused";

export type TaskStatus =
  | "not_started"
  | "ready"
  | "in_progress"
  | "waiting_for_approval"
  | "completed"
  | "blocked"
  | "skipped";

export type StageStatus = "pending" | "active" | "completed";

export type RecommendationType =
  | "strategy"
  | "next_action"
  | "daily_briefing"
  | "learning_update";

export interface Mission {
  id: string;
  user_id?: string | null;
  outcome_text: string;
  mission_title?: string | null;
  mission_summary?: string | null;
  target?: number | null;
  current_progress?: number | null;
  deadline?: string | null;
  strategy?: string | null;
  required_resources?: string[] | null;
  assumptions?: string[] | null;
  success_metrics?: string[] | null;
  approval_required?: string[] | null;
  status: MissionStatus;
  current_stage_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionQuestion {
  id: string;
  mission_id: string;
  question: string;
  answer?: string | null;
  sort_order: number;
  required: boolean;
  created_at: string;
}

export interface MissionStage {
  id: string;
  mission_id: string;
  title: string;
  description?: string | null;
  sort_order: number;
  status: StageStatus;
  created_at: string;
}

export interface Task {
  id: string;
  mission_id: string;
  stage_id?: string | null;
  title: string;
  description?: string | null;
  reason?: string | null;
  instructions?: string | null;
  suggested_content?: string | null;
  expected_result?: string | null;
  estimated_impact?: string | null;
  status: TaskStatus;
  approval_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskResult {
  id: string;
  task_id: string;
  mission_id: string;
  responses_count: number;
  yes_count: number;
  registrations_count: number;
  top_objection?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface AgentRecommendation {
  id: string;
  mission_id: string;
  recommendation_type: RecommendationType;
  title: string;
  content: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface PlannedTask {
  title: string;
  description: string;
  reason: string;
  instructions: string;
  suggested_content?: string;
  expected_result: string;
  estimated_impact: string;
  status: TaskStatus;
  approval_required: boolean;
  stage_index?: number;
}

export interface PlannedStage {
  title: string;
  description: string;
}

export interface MissionPlan {
  mission_title: string;
  mission_summary: string;
  target: number;
  deadline: string;
  assumptions: string[];
  clarifying_questions: string[];
  strategy: string;
  stages: PlannedStage[];
  tasks: PlannedTask[];
  approval_required: string[];
  success_metrics: string[];
  required_resources: string[];
  next_best_action: string;
}

export interface DailyBriefing {
  todays_mission: string[];
  target_for_today: string;
  agent_recommendation: string;
}

export interface MissionWithRelations extends Mission {
  questions: MissionQuestion[];
  stages: MissionStage[];
  tasks: Task[];
  recommendations: AgentRecommendation[];
  task_results: TaskResult[];
  cached_plan?: MissionPlan | null;
}
