import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ALL_CARDS, STARTER_CARD_IDS } from '../data/cards';
import { scoreJoke, getUnlockableCards } from '../utils/scoring';
import type { GameState, JokeScores, StageSlots } from '../types';
import { getCardById } from '../data/cards';

interface GameStore extends GameState {
  lastResult: JokeScores | null;
  showResults: boolean;
  setStageSlot: (slot: keyof StageSlots, cardId: string | null) => void;
  clearStage: () => void;
  submitJoke: () => JokeScores | null;
  dismissResults: () => void;
  isCardUnlocked: (cardId: string) => boolean;
  getUnlockedCards: () => typeof ALL_CARDS;
  newlyUnlockedIds: string[];
  clearNewlyUnlocked: () => void;
}

const emptyStage: StageSlots = {
  observation: null,
  technique: null,
  punchline: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      laughPoints: 0,
      unlockedCardIds: [...STARTER_CARD_IDS],
      jokesPerformed: 0,
      bestLaughScore: 0,
      bestKillTonyScore: 0,
      stage: { ...emptyStage },
      lastResult: null,
      showResults: false,
      newlyUnlockedIds: [],

      setStageSlot: (slot, cardId) => {
        set((state) => {
          const newStage = { ...state.stage, [slot]: cardId };
          if (cardId) {
            for (const key of Object.keys(newStage) as (keyof StageSlots)[]) {
              if (key !== slot && newStage[key] === cardId) {
                newStage[key] = null;
              }
            }
          }
          return { stage: newStage };
        });
      },

      clearStage: () => set({ stage: { ...emptyStage } }),

      submitJoke: () => {
        const { stage } = get();
        const obs = stage.observation ? getCardById(stage.observation) : null;
        const tech = stage.technique ? getCardById(stage.technique) : null;
        const punch = stage.punchline ? getCardById(stage.punchline) : null;

        if (!obs || !tech || !punch) return null;

        const result = scoreJoke([obs, tech, punch]);
        const newLaughPoints = get().laughPoints + result.laughPointsEarned;
        const currentUnlocked = get().unlockedCardIds;
        const unlockable = getUnlockableCards(ALL_CARDS, currentUnlocked, newLaughPoints);
        const newUnlocks = unlockable.map((c) => c.id);

        set({
          lastResult: result,
          showResults: true,
          laughPoints: newLaughPoints,
          jokesPerformed: get().jokesPerformed + 1,
          bestLaughScore: Math.max(get().bestLaughScore, result.laughScore),
          bestKillTonyScore: Math.max(get().bestKillTonyScore, result.killTonyScore),
          unlockedCardIds: [...currentUnlocked, ...newUnlocks],
          newlyUnlockedIds: newUnlocks,
        });

        return result;
      },

      dismissResults: () => {
        set({ showResults: false, stage: { ...emptyStage } });
      },

      isCardUnlocked: (cardId) => get().unlockedCardIds.includes(cardId),

      getUnlockedCards: () => {
        const ids = get().unlockedCardIds;
        return ALL_CARDS.filter((c) => ids.includes(c.id));
      },

      clearNewlyUnlocked: () => set({ newlyUnlockedIds: [] }),
    }),
    {
      name: 'kill-tony-builder-save',
      partialize: (state) => ({
        laughPoints: state.laughPoints,
        unlockedCardIds: state.unlockedCardIds,
        jokesPerformed: state.jokesPerformed,
        bestLaughScore: state.bestLaughScore,
        bestKillTonyScore: state.bestKillTonyScore,
      }),
    },
  ),
);
