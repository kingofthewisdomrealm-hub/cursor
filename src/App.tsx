import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { getCardById } from './data/cards';
import { Header } from './components/Header';
import { Stage } from './components/Stage';
import { CardDeck } from './components/CardDeck';
import { ComedyCardComponent } from './components/ComedyCard';
import { ResultsOverlay } from './components/ResultsOverlay';
import type { CardType } from './types';

function App() {
  const setStageSlot = useGameStore((s) => s.setStageSlot);
  const isCardUnlocked = useGameStore((s) => s.isCardUnlocked);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const cardId = event.active.id as string;
    if (isCardUnlocked(cardId)) {
      setActiveCardId(cardId);
    }
  }, [isCardUnlocked]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const over = event.over;
    if (over?.data.current?.slotType) {
      setActiveSlot(over.data.current.slotType as CardType);
    } else {
      setActiveSlot(null);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    setActiveSlot(null);

    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    if (!isCardUnlocked(cardId)) return;

    if (overId.startsWith('slot-')) {
      const slotType = over.data.current?.slotType as CardType;
      if (slotType) {
        setStageSlot(slotType, cardId);
      }
    }
  }, [isCardUnlocked, setStageSlot]);

  const activeCard = activeCardId ? getCardById(activeCardId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="mx-auto min-h-dvh max-w-4xl px-4 py-4">
        <Header />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Stage activeSlot={activeSlot} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-4"
        >
          <CardDeck type="observation" />
          <CardDeck type="technique" />
          <CardDeck type="punchline" />
        </motion.div>

        <p className="mt-6 text-center text-xs text-white/30">
          Combine Observation + Technique + Punchline to score laughs. Earn Laugh Points to unlock new cards.
        </p>
      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeCard ? (
          <div className="w-[160px] rotate-3">
            <ComedyCardComponent card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>

      <ResultsOverlay />
    </DndContext>
  );
}

export default App;
