import type { DataSourceMeta } from "@/types/storm";
import type { StormDataSource } from "./types";
import { sampleDataSource } from "./sample-source";
import { nwsAlertsSource } from "./nws-alerts";
import { airportObservationsSource } from "./airport-observations";
import { localNewsSource } from "./local-news";

/**
 * Registry of modular storm data sources.
 * Add new adapters here — scanner will pick them up automatically.
 */
export const DATA_SOURCES: StormDataSource[] = [
  sampleDataSource,
  nwsAlertsSource,
  airportObservationsSource,
  localNewsSource,
];

export function listDataSourceMeta(): DataSourceMeta[] {
  return DATA_SOURCES.map((s) => s.meta);
}

export function getEnabledSources(): StormDataSource[] {
  return DATA_SOURCES.filter((s) => s.meta.enabled);
}

export { sampleDataSource, nwsAlertsSource, airportObservationsSource, localNewsSource };
export type { StormDataSource };
