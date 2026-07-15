import { SAMPLE_STORMS } from "@/lib/sample-data";
import type { StormDataSource } from "./types";
import type { StormReport } from "@/types/storm";

function filterByHours(reports: StormReport[], sinceHours: number): StormReport[] {
  const cutoff = Date.now() - sinceHours * 60 * 60 * 1000;
  return reports.filter((r) => {
    const t = new Date(`${r.date}T${r.time}:00`).getTime();
    return t >= cutoff;
  });
}

/** Built-in sample source — powers the MVP with no external calls. */
export const sampleDataSource: StormDataSource = {
  meta: {
    id: "sample-florida",
    name: "Florida Sample Storm Dataset",
    description:
      "Curated sample hail, wind, tornado, severe thunderstorm, and hurricane reports across Florida for demo and offline use.",
    category: "sample",
    enabled: true,
    requiresAuth: false,
    notes: "Active by default. Disable when live sources are connected.",
  },
  async fetchReports({ sinceHours }) {
    return {
      reports: filterByHours(SAMPLE_STORMS, sinceHours),
      websitesChecked: ["sample://florida-storm-dataset"],
      errors: [],
    };
  },
};
