import { useCallback } from 'react'
import { STORM_EVENTS } from '../data/storms'
import { useLocalStorage } from './useLocalStorage'
import type { SavedStorm, StormEvent } from '../types/storm'

const SAVED_STORMS_KEY = 'florida-storm-map:saved-storms'

export function useSavedStorms() {
  const [savedStorms, setSavedStorms] = useLocalStorage<SavedStorm[]>(SAVED_STORMS_KEY, [])

  const isSaved = useCallback(
    (stormId: string) => savedStorms.some((storm) => storm.id === stormId),
    [savedStorms],
  )

  const saveStorm = useCallback(
    (storm: StormEvent) => {
      setSavedStorms((prev) => {
        if (prev.some((item) => item.id === storm.id)) return prev
        const entry: SavedStorm = {
          id: storm.id,
          eventType: storm.eventType,
          date: storm.date,
          city: storm.city,
          severity: storm.severity,
          savedAt: new Date().toISOString(),
        }
        return [entry, ...prev]
      })
    },
    [setSavedStorms],
  )

  const removeStorm = useCallback(
    (stormId: string) => {
      setSavedStorms((prev) => prev.filter((storm) => storm.id !== stormId))
    },
    [setSavedStorms],
  )

  const toggleSave = useCallback(
    (storm: StormEvent) => {
      if (isSaved(storm.id)) {
        removeStorm(storm.id)
      } else {
        saveStorm(storm)
      }
    },
    [isSaved, removeStorm, saveStorm],
  )

  const getStormById = useCallback((stormId: string) => {
    return STORM_EVENTS.find((storm) => storm.id === stormId)
  }, [])

  return {
    savedStorms,
    isSaved,
    saveStorm,
    removeStorm,
    toggleSave,
    getStormById,
  }
}
