import type { DisciplineId, EnvironmentId, RunSummary } from "@/game/types";

const KEY = "communication-survival-progress-v1";

export interface ProgressState {
  bestConfidence: number;
  bestWave: number;
  totalTransformed: number;
  runs: number;
  unlockedDisciplines: DisciplineId[];
  unlockedEnvironments: EnvironmentId[];
  masteredScenarios: string[];
  lastRun: RunSummary | null;
  playerLevel: number;
  hasSeenTutorial: boolean;
}

const DEFAULT: ProgressState = {
  bestConfidence: 0,
  bestWave: 0,
  totalTransformed: 0,
  runs: 0,
  unlockedDisciplines: ["sales"],
  unlockedEnvironments: ["networking", "salesFloor"],
  masteredScenarios: [],
  lastRun: null,
  playerLevel: 1,
  hasSeenTutorial: false,
};

export function markTutorialSeen() {
  const prev = loadProgress();
  if (prev.hasSeenTutorial) return prev;
  const next = { ...prev, hasSeenTutorial: true };
  saveProgress(next);
  return next;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadProgress(): ProgressState {
  if (!canUseStorage()) return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProgress(state: ProgressState) {
  if (!canUseStorage()) return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function recordRun(summary: RunSummary, masteredScenarioIds?: string[]) {
  const prev = loadProgress();
  const unlockedDisciplines = new Set(prev.unlockedDisciplines);
  const unlockedEnvironments = new Set(prev.unlockedEnvironments);

  // Unlock by meta player level / wave reached
  const playerLevel = Math.max(prev.playerLevel, summary.level);
  if (summary.wave >= 2) unlockedDisciplines.add("customerService");
  if (summary.wave >= 3) unlockedDisciplines.add("negotiation");
  if (summary.wave >= 4) unlockedDisciplines.add("publicSpeaking");
  if (summary.wave >= 5) unlockedDisciplines.add("leadership");
  if (summary.wave >= 6) unlockedDisciplines.add("conflictResolution");
  if (summary.wave >= 7) unlockedDisciplines.add("management");
  if (summary.wave >= 8) unlockedDisciplines.add("coaching");
  if (summary.wave >= 9) unlockedDisciplines.add("consulting");
  if (summary.wave >= 10) unlockedDisciplines.add("dating");

  unlockedEnvironments.add(summary.environment);
  if (summary.wave >= 2) unlockedEnvironments.add("coffeeShop");
  if (summary.wave >= 3) unlockedEnvironments.add("jobInterview");
  if (summary.wave >= 4) unlockedEnvironments.add("podcast");
  if (summary.wave >= 5) unlockedEnvironments.add("familyDinner");
  if (summary.wave >= 6) unlockedEnvironments.add("conference");
  if (summary.wave >= 7) unlockedEnvironments.add("negotiationRoom");
  if (summary.wave >= 8) unlockedEnvironments.add("stage");
  if (summary.wave >= 9) unlockedEnvironments.add("tradeShow");

  const mastered = new Set(prev.masteredScenarios);
  for (const id of masteredScenarioIds ?? []) mastered.add(id);

  const next: ProgressState = {
    bestConfidence: Math.max(prev.bestConfidence, summary.confidence),
    bestWave: Math.max(prev.bestWave, summary.wave),
    totalTransformed: prev.totalTransformed + summary.transformed,
    runs: prev.runs + 1,
    unlockedDisciplines: [...unlockedDisciplines],
    unlockedEnvironments: [...unlockedEnvironments],
    masteredScenarios: [...mastered],
    lastRun: summary,
    playerLevel,
    hasSeenTutorial: prev.hasSeenTutorial,
  };
  saveProgress(next);
  return next;
}
