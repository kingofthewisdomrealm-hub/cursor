export type IntegrationCapability =
  | "research"
  | "outreach_writing"
  | "prospect_list"
  | "social_content"
  | "strategy_analysis"
  | "general_execution"
  | "webhook";

export type ConnectorType = "builtin" | "openai" | "webhook" | "mcp";

export type DelegationStatus =
  | "idle"
  | "queued"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "failed";

export interface IntegrationApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: IntegrationCapability[];
  connector_type: ConnectorType;
  requires_approval: boolean;
  is_builtin: boolean;
  docs_url?: string;
}

export interface ConnectedIntegration {
  id: string;
  app_id: string;
  name: string;
  enabled: boolean;
  connector_type: ConnectorType;
  capabilities: IntegrationCapability[];
  config: IntegrationConfig;
  connected_at: string;
}

export interface IntegrationConfig {
  webhook_url?: string;
  api_key?: string;
  model?: string;
  custom_headers?: Record<string, string>;
}

export interface WorkRequest {
  mission_id: string;
  task_id: string;
  integration_id: string;
  app_id: string;
  capability: IntegrationCapability;
  mission_title: string;
  outcome_text: string;
  task: {
    title: string;
    description?: string | null;
    reason?: string | null;
    instructions?: string | null;
    suggested_content?: string | null;
    expected_result?: string | null;
  };
  context?: Record<string, string>;
}

export interface WorkResult {
  success: boolean;
  output: string;
  summary: string;
  requires_approval: boolean;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface TaskDelegation {
  id: string;
  mission_id: string;
  task_id: string;
  integration_id: string;
  app_id: string;
  app_name: string;
  capability: IntegrationCapability;
  status: DelegationStatus;
  request: WorkRequest;
  result?: WorkResult | null;
  created_at: string;
  completed_at?: string | null;
}
