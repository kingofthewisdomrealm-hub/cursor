import type { Airport } from '../types/storm'

export const FLORIDA_AIRPORTS: Airport[] = [
  { code: 'MIA', name: 'Miami International', latitude: 25.7959, longitude: -80.287 },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood', latitude: 26.0726, longitude: -80.1527 },
  { code: 'PBI', name: 'Palm Beach International', latitude: 26.6832, longitude: -80.0956 },
  { code: 'MCO', name: 'Orlando International', latitude: 28.4312, longitude: -81.3081 },
  { code: 'TPA', name: 'Tampa International', latitude: 27.9755, longitude: -82.5332 },
  { code: 'SRQ', name: 'Sarasota-Bradenton', latitude: 27.3954, longitude: -82.5544 },
  { code: 'RSW', name: 'Southwest Florida (Fort Myers)', latitude: 26.5362, longitude: -81.7552 },
  { code: 'JAX', name: 'Jacksonville International', latitude: 30.4941, longitude: -81.6879 },
  { code: 'TLH', name: 'Tallahassee International', latitude: 30.3965, longitude: -84.3503 },
  { code: 'PNS', name: 'Pensacola International', latitude: 30.4734, longitude: -87.1866 },
  { code: 'VRB', name: 'Vero Beach Regional', latitude: 27.6556, longitude: -80.4179 },
  { code: 'MLB', name: 'Melbourne Orlando International', latitude: 28.1028, longitude: -80.6453 },
]

export const AIRPORT_BY_CODE = Object.fromEntries(
  FLORIDA_AIRPORTS.map((airport) => [airport.code, airport]),
) as Record<string, Airport>
