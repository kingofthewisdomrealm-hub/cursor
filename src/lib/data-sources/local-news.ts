import type { StormDataSource } from "./types";

/**
 * Stub: local news storm coverage.
 * Only use public RSS / Open Graph feeds or licensed APIs.
 * Never bypass paywalls, CAPTCHAs, or login walls.
 */
export const localNewsSource: StormDataSource = {
  meta: {
    id: "local-news",
    name: "Florida Local News Weather",
    description:
      "Publicly available local news weather roundups via RSS or publisher APIs.",
    category: "local_news",
    enabled: false,
    requiresAuth: false,
    notes:
      "Use feed URLs only. Do not automate behind CAPTCHAs, paywalls, or protected logins.",
  },
  async fetchReports() {
    if (!this.meta.enabled) {
      return { reports: [], websitesChecked: [], errors: [] };
    }
    return {
      reports: [],
      websitesChecked: [],
      errors: ["Local news adapter not yet configured"],
    };
  },
};
