import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
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
