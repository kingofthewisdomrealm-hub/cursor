import type { StormDataSource } from "./types";

/**
 * Stub: airport ASOS/METAR observations (public NOAA feeds).
 */
export const airportObservationsSource: StormDataSource = {
  meta: {
    id: "airport-asos",
    name: "Florida Airport Observations",
    description:
      "Airport METAR/ASOS wind gust and weather observations for major FL terminals.",
    category: "airport",
    enabled: false,
    requiresAuth: false,
    notes: "Connect to aviationweather.gov or NOAA MADIS public products.",
  },
  async fetchReports() {
    if (!this.meta.enabled) {
      return { reports: [], websitesChecked: [], errors: [] };
    }
    return {
      reports: [],
      websitesChecked: ["https://aviationweather.gov/api/data/metar"],
      errors: ["Airport observation adapter not yet configured"],
    };
  },
};
