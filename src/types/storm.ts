export type StormEventType =
  | 'hail'
  | 'severe-wind'
  | 'tornado'
  | 'hurricane'
  | 'flooding'
  | 'thunderstorm'

export type SeverityLevel = 'minor' | 'moderate' | 'severe' | 'major'

export type DataSource = 'metar' | 'noaa' | 'news' | 'simulated'

export interface Airport {
  code: string
  name: string
  latitude: number
  longitude: number
}

export interface StormEvent {
  id: string
  eventType: StormEventType
  severity: SeverityLevel
  date: string
  time: string
  city: string
  county: string
  neighborhoods: string[]
  airportCode: string
  latitude: number
  longitude: number
  windSpeed: number | null
  hailSize: number | null
  /** Estimated damage area radius in miles; derived automatically when omitted */
  damageRadiusMiles?: number
  source: DataSource
  notes: string
}

export interface SavedStorm {
  id: string
  eventType: StormEventType
  date: string
  city: string
  severity: SeverityLevel
  neighborhoods?: string[]
  savedAt: string
}

export interface StormFilters {
  dateFrom: string
  dateTo: string
  eventTypes: StormEventType[]
  minHailSize: number
  minWindSpeed: number
  severities: SeverityLevel[]
  airportCode: string | null
}

export const STORM_EVENT_LABELS: Record<StormEventType, string> = {
  hail: 'Hail',
  'severe-wind': 'Severe Wind',
  tornado: 'Tornado',
  hurricane: 'Hurricane',
  flooding: 'Flooding',
  thunderstorm: 'Thunderstorm',
}

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  severe: 'Severe',
  major: 'Major',
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  minor: '#22c55e',
  moderate: '#eab308',
  severe: '#f97316',
  major: '#ef4444',
}

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  metar: 'Airport Weather (METAR)',
  noaa: 'NOAA Storm Events',
  news: 'News Report',
  simulated: 'Simulated Data',
}

export const FLORIDA_REGIONS = [
  'South Florida',
  'Central Florida',
  'Tampa Bay',
  'Southwest Florida',
  'Northeast Florida',
  'Panhandle',
  'Treasure Coast',
] as const

export type FloridaRegion = (typeof FLORIDA_REGIONS)[number]
