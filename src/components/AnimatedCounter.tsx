import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.2,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = value * eased
      setDisplay(start)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
