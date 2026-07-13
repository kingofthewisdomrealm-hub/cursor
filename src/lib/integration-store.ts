import { v4 as uuidv4 } from "uuid";
import type {
  ConnectedIntegration,
  IntegrationConfig,
  TaskDelegation,
} from "@/types/integration";
import { INTEGRATION_APPS, getAppById } from "@/lib/integrations/registry";

const STORAGE_KEY = "outcome-agent-integrations";
const DELEGATIONS_KEY = "outcome-agent-delegations";

function readIntegrations(): ConnectedIntegration[] {
  if (typeof window === "undefined") return getDefaultIntegrations();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultIntegrations();
    return JSON.parse(raw) as ConnectedIntegration[];
  } catch {
    return getDefaultIntegrations();
  }
}

function writeIntegrations(integrations: ConnectedIntegration[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
  } catch {
    // ignore
  }
}

function getDefaultIntegrations(): ConnectedIntegration[] {
  return INTEGRATION_APPS.filter((a) => a.id !== "custom-webhook").map(
    (app) => ({
      id: uuidv4(),
      app_id: app.id,
      name: app.name,
      enabled: app.id === "openai-worker" || app.id === "research-scout",
      connector_type: app.connector_type,
      capabilities: app.capabilities,
      config: {},
      connected_at: new Date().toISOString(),
    })
  );
}

export function getAllIntegrations(): ConnectedIntegration[] {
  const stored = readIntegrations();
  if (stored.length === 0) {
    const defaults = getDefaultIntegrations();
    writeIntegrations(defaults);
    return defaults;
  }
  return stored;
}

export function getEnabledIntegrations(): ConnectedIntegration[] {
  return getAllIntegrations().filter((i) => i.enabled);
}

export function connectApp(
  appId: string,
  config: IntegrationConfig = {}
): ConnectedIntegration | null {
  const app = getAppById(appId);
  if (!app) return null;

  const integrations = getAllIntegrations();
  const existing = integrations.find((i) => i.app_id === appId);

  if (existing) {
    existing.enabled = true;
    existing.config = { ...existing.config, ...config };
    writeIntegrations(integrations);
    return existing;
  }

  const entry: ConnectedIntegration = {
    id: uuidv4(),
    app_id: appId,
    name: app.name,
    enabled: true,
    connector_type: app.connector_type,
    capabilities: app.capabilities,
    config,
    connected_at: new Date().toISOString(),
  };

  integrations.push(entry);
  writeIntegrations(integrations);
  return entry;
}

export function disconnectApp(appId: string): void {
  const integrations = getAllIntegrations();
  const idx = integrations.findIndex((i) => i.app_id === appId);
  if (idx === -1) return;

  if (integrations[idx].app_id === "openai-worker") {
    integrations[idx].enabled = false;
  } else {
    integrations.splice(idx, 1);
  }
  writeIntegrations(integrations);
}

export function toggleIntegration(integrationId: string, enabled: boolean): void {
  const integrations = getAllIntegrations();
  const item = integrations.find((i) => i.id === integrationId);
  if (!item) return;
  item.enabled = enabled;
  writeIntegrations(integrations);
}

export function updateIntegrationConfig(
  integrationId: string,
  config: IntegrationConfig
): void {
  const integrations = getAllIntegrations();
  const item = integrations.find((i) => i.id === integrationId);
  if (!item) return;
  item.config = { ...item.config, ...config };
  writeIntegrations(integrations);
}

export function getIntegrationById(id: string): ConnectedIntegration | null {
  return getAllIntegrations().find((i) => i.id === id) ?? null;
}

function readDelegations(): TaskDelegation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELEGATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDelegations(delegations: TaskDelegation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DELEGATIONS_KEY, JSON.stringify(delegations));
  } catch {
    // ignore
  }
}

export function saveDelegation(delegation: TaskDelegation): void {
  const all = readDelegations();
  const idx = all.findIndex((d) => d.id === delegation.id);
  if (idx >= 0) all[idx] = delegation;
  else all.unshift(delegation);
  writeDelegations(all);
}

export function getDelegationsForTask(
  missionId: string,
  taskId: string
): TaskDelegation[] {
  return readDelegations().filter(
    (d) => d.mission_id === missionId && d.task_id === taskId
  );
}

export function getDelegationsForMission(missionId: string): TaskDelegation[] {
  return readDelegations().filter((d) => d.mission_id === missionId);
}

// Server-side helpers (no localStorage)
export function getDefaultIntegrationsForApi(): ConnectedIntegration[] {
  return INTEGRATION_APPS.filter((a) => a.id !== "custom-webhook").map(
    (app) => ({
      id: app.id,
      app_id: app.id,
      name: app.name,
      enabled: true,
      connector_type: app.connector_type,
      capabilities: app.capabilities,
      config: {},
      connected_at: new Date().toISOString(),
    })
  );
}
