import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ALL_CARDS, STARTER_CARD_IDS, getCardById } from '../data/cards';
import { scoreJoke, getUnlockableCards } from '../utils/scoring';
import { generateTechniqueBridge } from '../utils/aiTechnique';
import type { GameState, JokeScores, StageSlots } from '../types';

interface GameStore extends GameState {
  lastResult: JokeScores | null;
  showResults: boolean;
  generatedTechnique: string | null;
  isGeneratingTechnique: boolean;
  techniqueError: string | null;
  setStageSlot: (slot: keyof StageSlots, cardId: string | null) => void;
  clearStage: () => void;
  regenerateTechnique: () => Promise<void>;
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

let generationRequestId = 0;

async function runTechniqueGeneration(
  observationId: string,
  techniqueId: string,
  set: (partial: Partial<GameStore>) => void,
) {
  const requestId = ++generationRequestId;
  const obs = getCardById(observationId);
  const tech = getCardById(techniqueId);

  if (!obs || !tech) return;

  set({ isGeneratingTechnique: true, techniqueError: null, generatedTechnique: null });

  const minDelay = new Promise((r) => setTimeout(r, 900));

  try {
    const [generated] = await Promise.all([
      generateTechniqueBridge(obs.text, tech.id, tech.text),
      minDelay,
    ]);
    if (requestId !== generationRequestId) return;
    set({ generatedTechnique: generated, isGeneratingTechnique: false, techniqueError: null });
  } catch {
    if (requestId !== generationRequestId) return;
    set({
      isGeneratingTechnique: false,
      techniqueError: 'Failed to generate technique. Try again.',
      generatedTechnique: null,
    });
  }
}

function maybeTriggerGeneration(
  stage: StageSlots,
  set: (partial: Partial<GameStore>) => void,
) {
  if (stage.observation && stage.technique) {
    runTechniqueGeneration(stage.observation, stage.technique, set);
  } else {
    generationRequestId++;
    set({ generatedTechnique: null, isGeneratingTechnique: false, techniqueError: null });
  }
}

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
      generatedTechnique: null,
      isGeneratingTechnique: false,
      techniqueError: null,

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

        const { stage } = get();
        if (slot === 'technique' || slot === 'observation') {
          maybeTriggerGeneration(stage, set);
        }
        if (slot === 'technique' && !cardId) {
          generationRequestId++;
          set({ generatedTechnique: null, isGeneratingTechnique: false, techniqueError: null });
        }
        if (slot === 'observation' && !cardId) {
          generationRequestId++;
          set({ generatedTechnique: null, isGeneratingTechnique: false, techniqueError: null });
        }
      },

      clearStage: () => {
        generationRequestId++;
        set({
          stage: { ...emptyStage },
          generatedTechnique: null,
          isGeneratingTechnique: false,
          techniqueError: null,
        });
      },

      regenerateTechnique: async () => {
        const { stage } = get();
        if (stage.observation && stage.technique) {
          await runTechniqueGeneration(stage.observation, stage.technique, set);
        }
      },

      submitJoke: () => {
        const { stage, generatedTechnique, isGeneratingTechnique } = get();
        const obs = stage.observation ? getCardById(stage.observation) : null;
        const tech = stage.technique ? getCardById(stage.technique) : null;
        const punch = stage.punchline ? getCardById(stage.punchline) : null;

        if (!obs || !tech || !punch || !generatedTechnique || isGeneratingTechnique) return null;

        const techWithGenerated = { ...tech, text: generatedTechnique };
        const result = scoreJoke([obs, techWithGenerated, punch]);
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
        generationRequestId++;
        set({
          showResults: false,
          stage: { ...emptyStage },
          generatedTechnique: null,
          isGeneratingTechnique: false,
          techniqueError: null,
        });
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
