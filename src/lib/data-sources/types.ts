import type { DataSourceMeta, StormReport } from "@/types/storm";

/**
 * Modular data-source contract.
 * Real adapters should respect robots.txt / ToS and must never bypass
 * CAPTCHAs, logins, paywalls, or other access controls.
 */
export interface StormDataSource {
  meta: DataSourceMeta;
  fetchReports(params: { sinceHours: number }): Promise<{
    reports: StormReport[];
    websitesChecked: string[];
    errors: string[];
  }>;
}
