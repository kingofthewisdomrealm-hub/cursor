"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DIAGNOSED_LEVEL,
  LEVELS,
  type MasteryLevelId,
  isLevelCleared,
} from "@/data/mastery";

interface MasteryStore {
  introSeen: boolean;
  viewedLevel: MasteryLevelId;
  completed: Record<number, string[]>;
  dismissIntro: () => void;
  setViewedLevel: (id: MasteryLevelId) => void;
  toggleMission: (levelId: MasteryLevelId, missionId: string) => void;
  goNext: () => void;
  goPrev: () => void;
  resetClimb: () => void;
}

const EMPTY: Record<number, string[]> = {};

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      introSeen: false,
      viewedLevel: DIAGNOSED_LEVEL,
      completed: EMPTY,
      dismissIntro: () => set({ introSeen: true, viewedLevel: 0 }),
      setViewedLevel: (id) => set({ viewedLevel: id }),
      toggleMission: (levelId, missionId) => {
        set((state) => {
          const current = state.completed[levelId] ?? [];
          const next = current.includes(missionId)
            ? current.filter((id) => id !== missionId)
            : [...current, missionId];
          return { completed: { ...state.completed, [levelId]: next } };
        });
      },
      goNext: () => {
        const { viewedLevel, completed } = get();
        if (viewedLevel >= 5) return;
        if (!isLevelCleared(viewedLevel, completed)) return;
        set({ viewedLevel: (viewedLevel + 1) as MasteryLevelId });
      },
      goPrev: () => {
        const { viewedLevel } = get();
        if (viewedLevel <= 0) return;
        set({ viewedLevel: (viewedLevel - 1) as MasteryLevelId });
      },
      resetClimb: () =>
        set({
          introSeen: false,
          viewedLevel: DIAGNOSED_LEVEL,
          completed: {},
        }),
    }),
    { name: "cursor-mastery-pyramid" },
  ),
);

export function clearedCount(completed: Record<number, string[]>): number {
  return LEVELS.filter((level) => isLevelCleared(level.id, completed)).length;
}
