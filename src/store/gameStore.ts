"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import scenariosData from "@/data/scenarios.json";
import { PACKS } from "@/data/packs";
import { UPGRADES } from "@/data/upgrades";
import type {
  CombatStats,
  GamePhase,
  HudSnapshot,
  ProgressionState,
  RunStats,
  Scenario,
  UpgradeId,
} from "@/types/game";

const SCENARIOS = scenariosData as Scenario[];

export const DEFAULT_COMBAT: CombatStats = {
  fireRateMult: 1,
  damageMult: 1,
  moveSpeedMult: 1,
  survivorCount: 1,
  piercing: false,
  explosiveAmmo: false,
  healingDrone: false,
  weapons: ["default"],
};

export const DEFAULT_HUD: HudSnapshot = {
  hp: 100,
  maxHp: 100,
  level: 1,
  xp: 0,
  xpToNext: 20,
  wave: 1,
  waveTimer: 45,
  kills: 0,
  survivorCount: 1,
};

const DEFAULT_PROGRESSION: ProgressionState = {
  totalXp: 0,
  unlockedPackIds: ["customer_service"],
  bestScore: 0,
  bestAccuracy: 0,
  runsCompleted: 0,
};

interface GameStore {
  phase: GamePhase;
  selectedPackId: string;
  combat: CombatStats;
  run: RunStats;
  hud: HudSnapshot;
  progression: ProgressionState;
  currentScenario: Scenario | null;
  lastAnswerCorrect: boolean | null;
  offeredUpgrades: UpgradeId[];
  usedScenarioIds: string[];
  bridgeVersion: number;

  setPhase: (phase: GamePhase) => void;
  setSelectedPack: (packId: string) => void;
  setHud: (hud: Partial<HudSnapshot>) => void;
  syncRunStats: (partial: Partial<RunStats>) => void;
  startRun: () => void;
  beginChallenge: () => void;
  answerChallenge: (optionId: string) => void;
  continueAfterExplanation: () => void;
  pickUpgrade: (id: UpgradeId) => void;
  applyUpgrade: (id: UpgradeId) => void;
  endRun: (reason: "death" | "manual") => void;
  resumeCombat: () => void;
  bumpBridge: () => void;
  getAvailableScenarios: () => Scenario[];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function offerUpgrades(combat: CombatStats, taken: UpgradeId[]): UpgradeId[] {
  const counts = taken.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});

  const eligible = UPGRADES.filter((u) => {
    const have = counts[u.id] ?? 0;
    if (!u.stackable && have > 0) return false;
    if (have >= u.maxStacks) return false;
    if (u.id === "shotgun" && combat.weapons.includes("shotgun")) return false;
    if (u.id === "flamethrower" && combat.weapons.includes("flamethrower"))
      return false;
    if (u.id === "sniper" && combat.weapons.includes("sniper")) return false;
    if (u.id === "grenades" && combat.weapons.includes("grenades")) return false;
    return true;
  });

  return shuffle(eligible)
    .slice(0, 3)
    .map((u) => u.id);
}

function applyUpgradeToCombat(
  combat: CombatStats,
  id: UpgradeId,
): CombatStats {
  const next = { ...combat, weapons: [...combat.weapons] };
  switch (id) {
    case "fire_rate":
      next.fireRateMult *= 1.25;
      break;
    case "damage":
      next.damageMult *= 1.2;
      break;
    case "move_speed":
      next.moveSpeedMult *= 1.15;
      break;
    case "extra_survivor":
      next.survivorCount += 1;
      break;
    case "piercing":
      next.piercing = true;
      break;
    case "shotgun":
      if (!next.weapons.includes("shotgun")) next.weapons.push("shotgun");
      break;
    case "flamethrower":
      if (!next.weapons.includes("flamethrower"))
        next.weapons.push("flamethrower");
      break;
    case "sniper":
      if (!next.weapons.includes("sniper")) next.weapons.push("sniper");
      break;
    case "grenades":
      if (!next.weapons.includes("grenades")) next.weapons.push("grenades");
      break;
    case "healing_drone":
      next.healingDrone = true;
      break;
    case "explosive_ammo":
      next.explosiveAmmo = true;
      break;
    default:
      break;
  }
  return next;
}

function unlockPacks(totalXp: number, unlocked: string[]): string[] {
  const set = new Set(unlocked);
  for (const pack of PACKS) {
    if (totalXp >= pack.unlockXp) set.add(pack.id);
  }
  return [...set];
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: "menu",
      selectedPackId: "customer_service",
      combat: { ...DEFAULT_COMBAT },
      run: {
        kills: 0,
        wave: 1,
        survivalSeconds: 0,
        questionsAnswered: 0,
        questionsCorrect: 0,
        xpCollected: 0,
        level: 1,
        upgradesTaken: [],
      },
      hud: { ...DEFAULT_HUD },
      progression: { ...DEFAULT_PROGRESSION },
      currentScenario: null,
      lastAnswerCorrect: null,
      offeredUpgrades: [],
      usedScenarioIds: [],
      bridgeVersion: 0,

      setPhase: (phase) => set({ phase }),
      setSelectedPack: (packId) => set({ selectedPackId: packId }),
      setHud: (hud) => set((s) => ({ hud: { ...s.hud, ...hud } })),
      syncRunStats: (partial) =>
        set((s) => ({ run: { ...s.run, ...partial } })),
      bumpBridge: () => set((s) => ({ bridgeVersion: s.bridgeVersion + 1 })),

      getAvailableScenarios: () => {
        const { progression, selectedPackId, usedScenarioIds } = get();
        const unlocked = new Set(progression.unlockedPackIds);
        const pool = SCENARIOS.filter(
          (s) =>
            unlocked.has(s.packId) &&
            (s.packId === selectedPackId || selectedPackId === "all"),
        );
        const fresh = pool.filter((s) => !usedScenarioIds.includes(s.id));
        return fresh.length > 0 ? fresh : pool;
      },

      startRun: () => {
        set({
          phase: "combat",
          combat: { ...DEFAULT_COMBAT, weapons: ["default"] },
          run: {
            kills: 0,
            wave: 1,
            survivalSeconds: 0,
            questionsAnswered: 0,
            questionsCorrect: 0,
            xpCollected: 0,
            level: 1,
            upgradesTaken: [],
          },
          hud: { ...DEFAULT_HUD },
          currentScenario: null,
          lastAnswerCorrect: null,
          offeredUpgrades: [],
          usedScenarioIds: [],
          bridgeVersion: get().bridgeVersion + 1,
        });
      },

      beginChallenge: () => {
        const available = get().getAvailableScenarios();
        if (available.length === 0) {
          set({ phase: "combat" });
          return;
        }
        const scenario = available[Math.floor(Math.random() * available.length)];
        set((s) => ({
          phase: "challenge",
          currentScenario: scenario,
          usedScenarioIds: [...s.usedScenarioIds, scenario.id],
          lastAnswerCorrect: null,
        }));
      },

      answerChallenge: (optionId) => {
        const scenario = get().currentScenario;
        if (!scenario) return;
        const correct = optionId === scenario.correctOptionId;
        set((s) => ({
          phase: "explanation",
          lastAnswerCorrect: correct,
          run: {
            ...s.run,
            questionsAnswered: s.run.questionsAnswered + 1,
            questionsCorrect: s.run.questionsCorrect + (correct ? 1 : 0),
          },
        }));
      },

      continueAfterExplanation: () => {
        const { lastAnswerCorrect, combat, run } = get();
        if (lastAnswerCorrect) {
          set({
            phase: "upgrade",
            offeredUpgrades: offerUpgrades(combat, run.upgradesTaken),
          });
        } else {
          get().resumeCombat();
        }
      },

      pickUpgrade: (id) => {
        get().applyUpgrade(id);
        get().resumeCombat();
      },

      applyUpgrade: (id) => {
        set((s) => ({
          combat: applyUpgradeToCombat(s.combat, id),
          run: {
            ...s.run,
            upgradesTaken: [...s.run.upgradesTaken, id],
          },
          hud: {
            ...s.hud,
            survivorCount:
              id === "extra_survivor"
                ? s.hud.survivorCount + 1
                : s.hud.survivorCount,
          },
        }));
      },

      resumeCombat: () => {
        set((s) => ({
          phase: "combat",
          currentScenario: null,
          offeredUpgrades: [],
          run: { ...s.run, wave: s.run.wave + 1 },
          hud: { ...s.hud, wave: s.hud.wave + 1, waveTimer: 45 },
          bridgeVersion: s.bridgeVersion + 1,
        }));
      },

      endRun: () => {
        const { run, progression } = get();
        const accuracy =
          run.questionsAnswered > 0
            ? Math.round((run.questionsCorrect / run.questionsAnswered) * 100)
            : 0;
        const score =
          run.kills * 10 +
          run.survivalSeconds * 2 +
          run.questionsCorrect * 50 +
          run.level * 25;
        const gainedXp = Math.max(
          25,
          Math.floor(score / 4) + run.questionsCorrect * 15,
        );
        const totalXp = progression.totalXp + gainedXp;
        const unlockedPackIds = unlockPacks(
          totalXp,
          progression.unlockedPackIds,
        );

        set({
          phase: "score",
          progression: {
            totalXp,
            unlockedPackIds,
            bestScore: Math.max(progression.bestScore, score),
            bestAccuracy: Math.max(progression.bestAccuracy, accuracy),
            runsCompleted: progression.runsCompleted + 1,
          },
          bridgeVersion: get().bridgeVersion + 1,
        });
      },
    }),
    {
      name: "comm-survival-progress",
      partialize: (state) => ({
        progression: state.progression,
        selectedPackId: state.selectedPackId,
      }),
    },
  ),
);

export function getRunScore(run: RunStats): number {
  return (
    run.kills * 10 +
    run.survivalSeconds * 2 +
    run.questionsCorrect * 50 +
    run.level * 25
  );
}

export function getAccuracy(run: RunStats): number {
  if (run.questionsAnswered === 0) return 0;
  return Math.round((run.questionsCorrect / run.questionsAnswered) * 100);
}

export { SCENARIOS };
