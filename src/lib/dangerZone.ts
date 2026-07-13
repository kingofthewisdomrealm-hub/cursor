import type { SeverityLevel, StormEvent, StormEventType } from '../types/storm'
import { SEVERITY_COLORS } from '../types/storm'

const SEVERITY_MULTIPLIER: Record<SeverityLevel, number> = {
  minor: 1,
  moderate: 1.4,
  severe: 2.2,
  major: 3.5,
}

const BASE_RADIUS_BY_TYPE: Record<StormEventType, number> = {
  hail: 1.2,
  'severe-wind': 2,
  tornado: 0.8,
  hurricane: 12,
  flooding: 2.5,
  thunderstorm: 1.5,
}

/**
 * Estimates the storm damage danger zone radius in miles.
 * Uses explicit data when available; otherwise derives from event type,
 * severity, wind speed, and hail size for planning visualization.
 */
export function getDangerZoneRadiusMiles(storm: StormEvent): number {
  if (storm.damageRadiusMiles != null) {
    return storm.damageRadiusMiles
  }

  let radius = BASE_RADIUS_BY_TYPE[storm.eventType] * SEVERITY_MULTIPLIER[storm.severity]

  if (storm.windSpeed != null) {
    radius += storm.windSpeed / 35
  }

  if (storm.hailSize != null) {
    radius += storm.hailSize * 0.9
  }

  if (storm.eventType === 'tornado') {
    radius = Math.max(radius, storm.severity === 'major' ? 2.5 : storm.severity === 'severe' ? 1.5 : 0.6)
  }

  if (storm.eventType === 'hurricane') {
    radius = Math.max(radius, 8)
  }

  const maxRadius = storm.eventType === 'hurricane' ? 35 : 15
  return Math.round(Math.min(Math.max(radius, 0.5), maxRadius) * 10) / 10
}

export function getDangerZoneStyle(storm: StormEvent, isSelected: boolean) {
  const color = SEVERITY_COLORS[storm.severity]

  if (isSelected) {
    return {
      color,
      fillColor: color,
      fillOpacity: 0.22,
      weight: 3,
      dashArray: undefined as string | undefined,
    }
  }

  return {
    color,
    fillColor: color,
    fillOpacity: 0.06,
    weight: 1.5,
    dashArray: '4 6',
  }
}

export function getDangerZoneDescription(storm: StormEvent): string {
  const radius = getDangerZoneRadiusMiles(storm)
  const typeLabel = storm.eventType.replace('-', ' ')

  return `Estimated ${radius}-mile ${typeLabel} damage zone based on reported severity, wind, and hail data.`
}
