import { STORM_EVENTS } from '../data/storms'
import type { StormEvent } from '../types/storm'

/**
 * Data access layer for storm events.
 * Version 1 uses bundled sample data; future versions can swap in
 * METAR observations, NOAA Storm Events, and news-reported events.
 */
export interface StormDataProvider {
  getEvents(): Promise<StormEvent[]>
}

export const localStormProvider: StormDataProvider = {
  async getEvents() {
    return STORM_EVENTS
  },
}

// Future providers:
// export const metarStormProvider: StormDataProvider = { ... }
// export const noaaStormProvider: StormDataProvider = { ... }
// export const newsStormProvider: StormDataProvider = { ... }
