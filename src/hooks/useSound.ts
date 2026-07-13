import { useCallback, useRef } from 'react'

export type SoundType =
  | 'select'
  | 'move'
  | 'merge'
  | 'crossMerge'
  | 'challenge'
  | 'rankUp'
  | 'ascension'
  | 'generate'

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
      if (!enabled) return
      try {
        const ctx = getCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = type
        osc.frequency.value = freq
        gain.gain.setValueAtTime(volume, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration)
      } catch {
        // Audio not available
      }
    },
    [enabled, getCtx],
  )

  const play = useCallback(
    (type: SoundType) => {
      switch (type) {
        case 'select':
          playTone(440, 0.08, 'sine', 0.1)
          break
        case 'move':
          playTone(330, 0.1, 'triangle', 0.08)
          break
        case 'merge':
          playTone(523, 0.15, 'sine', 0.12)
          setTimeout(() => playTone(659, 0.2, 'sine', 0.1), 80)
          break
        case 'crossMerge':
          playTone(440, 0.1, 'sine', 0.12)
          setTimeout(() => playTone(554, 0.1, 'sine', 0.12), 100)
          setTimeout(() => playTone(659, 0.25, 'sine', 0.15), 200)
          break
        case 'challenge':
          playTone(587, 0.12, 'square', 0.08)
          setTimeout(() => playTone(784, 0.2, 'square', 0.1), 120)
          break
        case 'rankUp':
          playTone(392, 0.15, 'sine', 0.12)
          setTimeout(() => playTone(494, 0.15, 'sine', 0.12), 150)
          setTimeout(() => playTone(587, 0.3, 'sine', 0.15), 300)
          break
        case 'ascension':
          ;[262, 330, 392, 523, 659, 784].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.3, 'sine', 0.12), i * 120)
          })
          break
        case 'generate':
          playTone(280, 0.12, 'triangle', 0.08)
          break
      }
    },
    [playTone],
  )

  return { play }
}
