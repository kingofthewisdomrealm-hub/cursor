import { useState, useEffect } from 'react'
import { GameHeader } from './components/GameHeader'
import { BlueprintBoard } from './components/BlueprintBoard'
import { CardDeck } from './components/CardDeck'
import { RunSimulationButton } from './components/RunSimulationButton'
import { SimulationResults } from './components/SimulationResults'
import { XpPopupDisplay } from './components/XpPopupDisplay'
import { BottomNavigation } from './components/BottomNavigation'
import { BossBattlePanel } from './components/BossBattlePanel'
import { CollectionScreen } from './components/CollectionScreen'
import { AchievementsScreen } from './components/AchievementsScreen'
import { SettingsModal } from './components/SettingsModal'
import { useGameProgress } from './hooks/useGameProgress'
import { getBossBattle } from './config/bossBattles'
import type { ViewId } from './types/game'

function App() {
  const game = useGameProgress()
  const [view, setView] = useState<ViewId>('play')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const {
    state,
    level,
    nextLevel,
    activeSlotTypes,
    availableCards,
    slots,
    selectedCard,
    lastResult,
    showResults,
    allSlotsFilled,
    activeBoss,
    popups,
    handleSlotTap,
    placeCard,
    handleCardSelect,
    clearBoard,
    runBusinessSimulation,
    startBossBattle,
    endBossBattle,
    setShowResults,
    updateSettings,
    resetProgress,
  } = game

  const filledCardIds = activeSlotTypes
    .map((s) => slots[s]?.id)
    .filter(Boolean) as string[]

  const boss = activeBoss ? getBossBattle(activeBoss) : null

  useEffect(() => {
    document.body.style.overflow = view === 'play' ? 'hidden' : 'auto'
  }, [view])

  return (
    <div className="game-container relative">
      {view === 'play' && (
        <>
          <GameHeader
            xp={state.xp}
            levelName={level.name}
            nextLevelName={nextLevel?.name}
            streak={state.streak}
          />

          {boss && (
            <div className="mx-4 mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2">
              <span className="text-2xl">{boss.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-orange-800">{boss.name}</p>
                <p className="text-xs text-orange-600 truncate">{boss.challenge}</p>
              </div>
              <button
                type="button"
                onClick={endBossBattle}
                className="text-xs text-orange-500 font-medium shrink-0"
              >
                Quit
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 pb-36 space-y-4">
            <BlueprintBoard
              slots={slots}
              activeSlots={activeSlotTypes}
              selectedCard={selectedCard}
              onSlotTap={handleSlotTap}
              onDrop={placeCard}
            />
            <CardDeck
              cards={availableCards}
              activeSlots={activeSlotTypes}
              selectedCard={selectedCard}
              filledCardIds={filledCardIds}
              onSelect={handleCardSelect}
            />
          </div>

          <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 z-20">
            <div className="max-w-md mx-auto">
              <RunSimulationButton
                disabled={!allSlotsFilled}
                onRun={runBusinessSimulation}
                bossActive={!!activeBoss}
              />
            </div>
          </div>
        </>
      )}

      {view === 'boss' && (
        <BossBattlePanel
          playerLevel={level.id}
          completedBosses={state.completedBossBattles}
          activeBoss={activeBoss}
          onStart={(id) => {
            startBossBattle(id)
            setView('play')
          }}
          onBack={() => setView('play')}
        />
      )}

      {view === 'collection' && (
        <CollectionScreen
          unlockedCardIds={state.unlockedCards}
          playerLevel={level.id}
          onBack={() => setView('play')}
        />
      )}

      {view === 'achievements' && (
        <AchievementsScreen
          unlockedIds={state.unlockedAchievements}
          stats={state.stats}
          bestStreak={state.bestStreak}
          onBack={() => setView('play')}
        />
      )}

      <BottomNavigation
        currentView={settingsOpen ? 'settings' : view}
        onNavigate={(v) => {
          if (v === 'settings') setSettingsOpen(true)
          else setView(v)
        }}
      />

      <SettingsModal
        open={settingsOpen}
        soundEnabled={state.settings.soundEnabled}
        animationsEnabled={state.settings.animationsEnabled}
        onClose={() => setSettingsOpen(false)}
        onToggleSound={() => updateSettings({ soundEnabled: !state.settings.soundEnabled })}
        onToggleAnimations={() =>
          updateSettings({ animationsEnabled: !state.settings.animationsEnabled })
        }
        onReset={resetProgress}
      />

      {showResults && lastResult && (
        <SimulationResults
          result={lastResult}
          onClose={() => setShowResults(false)}
          onPlayAgain={() => {
            setShowResults(false)
            clearBoard()
          }}
          animationsEnabled={state.settings.animationsEnabled}
        />
      )}

      <XpPopupDisplay popups={popups} />
    </div>
  )
}

export default App
