import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Storage full or unavailable
        }
        return next
      })
    },
    [key],
  )

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue) as T)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  return [storedValue, setValue] as const
}

export function usePersistedState<T>(load: () => T, save: (v: T) => void) {
  const [state, setState] = useState<T>(load)

  const setPersisted = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
        save(next)
        return next
      })
    },
    [save],
  )

  return [state, setPersisted] as const
}
