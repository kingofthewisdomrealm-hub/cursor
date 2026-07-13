import type {
  FloridaRegion,
  StormEvent,
  StormFilters,
  StormEventType,
  SeverityLevel,
} from '../types/storm'

const COUNTY_TO_REGION: Record<string, FloridaRegion> = {
  'Miami-Dade': 'South Florida',
  Broward: 'South Florida',
  'Palm Beach': 'South Florida',
  Monroe: 'South Florida',
  Orange: 'Central Florida',
  Osceola: 'Central Florida',
  Seminole: 'Central Florida',
  Lake: 'Central Florida',
  Polk: 'Central Florida',
  Hillsborough: 'Tampa Bay',
  Pinellas: 'Tampa Bay',
  Pasco: 'Tampa Bay',
  Manatee: 'Tampa Bay',
  Sarasota: 'Tampa Bay',
  Lee: 'Southwest Florida',
  Collier: 'Southwest Florida',
  Charlotte: 'Southwest Florida',
  Duval: 'Northeast Florida',
  'St. Johns': 'Northeast Florida',
  Clay: 'Northeast Florida',
  Nassau: 'Northeast Florida',
  Escambia: 'Panhandle',
  'Santa Rosa': 'Panhandle',
  Okaloosa: 'Panhandle',
  Bay: 'Panhandle',
  Leon: 'Panhandle',
  'Indian River': 'Treasure Coast',
  'St. Lucie': 'Treasure Coast',
  Martin: 'Treasure Coast',
  Brevard: 'Treasure Coast',
}

export function getRegionForCounty(county: string): FloridaRegion {
  return COUNTY_TO_REGION[county] ?? 'Central Florida'
}

export function isInCurrentMonth(dateString: string, referenceDate = new Date()): boolean {
  const date = new Date(`${dateString}T12:00:00`)
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  )
}

export function filterStorms(storms: StormEvent[], filters: StormFilters): StormEvent[] {
  return storms.filter((storm) => {
    if (storm.date < filters.dateFrom || storm.date > filters.dateTo) return false
    if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(storm.eventType)) return false
    if (filters.severities.length > 0 && !filters.severities.includes(storm.severity)) return false
    if (filters.airportCode && storm.airportCode !== filters.airportCode) return false
    if (filters.minHailSize > 0 && (storm.hailSize ?? 0) < filters.minHailSize) return false
    if (filters.minWindSpeed > 0 && (storm.windSpeed ?? 0) < filters.minWindSpeed) return false
    return true
  })
}

export function getDashboardStats(storms: StormEvent[], referenceDate = new Date()) {
  const monthStorms = storms.filter((storm) => isInCurrentMonth(storm.date, referenceDate))
  const regionCounts = new Map<FloridaRegion, number>()

  for (const storm of monthStorms) {
    const region = getRegionForCounty(storm.county)
    regionCounts.set(region, (regionCounts.get(region) ?? 0) + 1)
  }

  let mostActiveRegion: FloridaRegion = 'Central Florida'
  let maxCount = 0
  for (const [region, count] of regionCounts) {
    if (count > maxCount) {
      maxCount = count
      mostActiveRegion = region
    }
  }

  return {
    totalThisMonth: monthStorms.length,
    severeThisMonth: monthStorms.filter((storm) => storm.severity === 'severe').length,
    majorThisMonth: monthStorms.filter((storm) => storm.severity === 'major').length,
    mostActiveRegion: monthStorms.length > 0 ? mostActiveRegion : 'No activity',
  }
}

export function getDefaultFilters(storms: StormEvent[]): StormFilters {
  const dates = storms.map((storm) => storm.date).sort()
  return {
    dateFrom: dates[0] ?? new Date().toISOString().slice(0, 10),
    dateTo: dates[dates.length - 1] ?? new Date().toISOString().slice(0, 10),
    eventTypes: [],
    minHailSize: 0,
    minWindSpeed: 0,
    severities: [],
    airportCode: null,
  }
}

export const ALL_EVENT_TYPES: StormEventType[] = [
  'hail',
  'severe-wind',
  'tornado',
  'hurricane',
  'flooding',
  'thunderstorm',
]

export const ALL_SEVERITIES: SeverityLevel[] = ['minor', 'moderate', 'severe', 'major']
