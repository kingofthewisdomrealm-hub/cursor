import type { StormDataSource } from "./types";

/**
 * Stub: National Weather Service public alerts / LSR.
 * Wire to api.weather.gov when credentials / rate limits are configured.
 * Do not scrape protected HTML; use official APIs only.
 */
export const nwsAlertsSource: StormDataSource = {
  meta: {
    id: "nws-alerts",
    name: "NWS Alerts & Local Storm Reports",
    description:
      "Government alerts and storm reports via the National Weather Service public API (api.weather.gov).",
    category: "government_alert",
    enabled: false,
    requiresAuth: false,
    notes: "Enable and implement fetchReports using publicly documented NWS endpoints.",
  },
  async fetchReports() {
    if (!this.meta.enabled) {
      return { reports: [], websitesChecked: [], errors: [] };
    }
    // Placeholder — connect to api.weather.gov when ready
    return {
      reports: [],
      websitesChecked: ["https://api.weather.gov/alerts/active?area=FL"],
      errors: ["NWS adapter not yet configured"],
    };
  },
};
