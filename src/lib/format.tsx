import {
  CloudLightning,
  CloudRain,
  Tornado,
  Wind,
  CloudHail,
  Cloudy,
} from 'lucide-react'
import type { StormEventType } from '../types/storm'

export function getEventIcon(type: StormEventType, className = 'h-4 w-4') {
  const props = { className, 'aria-hidden': true as const }
  switch (type) {
    case 'hail':
      return <CloudHail {...props} />
    case 'severe-wind':
      return <Wind {...props} />
    case 'tornado':
      return <Tornado {...props} />
    case 'hurricane':
      return <Cloudy {...props} />
    case 'flooding':
      return <CloudRain {...props} />
    case 'thunderstorm':
      return <CloudLightning {...props} />
  }
}

export function formatHailSize(inches: number | null): string {
  if (inches === null) return '—'
  return `${inches}"`
}

export function formatWindSpeed(mph: number | null): string {
  if (mph === null) return '—'
  return `${mph} mph`
}

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatSavedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
