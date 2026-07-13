import { FLORIDA_AIRPORTS } from '../data/airports'
import type { Airport } from '../types/storm'

const EARTH_RADIUS_MILES = 3958.8

export function haversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function findNearestAirport(latitude: number, longitude: number): Airport {
  return FLORIDA_AIRPORTS.reduce((nearest, airport) => {
    const nearestDistance = haversineDistanceMiles(
      latitude,
      longitude,
      nearest.latitude,
      nearest.longitude,
    )
    const airportDistance = haversineDistanceMiles(
      latitude,
      longitude,
      airport.latitude,
      airport.longitude,
    )
    return airportDistance < nearestDistance ? airport : nearest
  })
}

export function milesToMeters(miles: number): number {
  return miles * 1609.34
}
