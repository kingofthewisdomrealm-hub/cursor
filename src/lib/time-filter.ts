import type { StormReport, TimeFilter } from "@/types/storm";

export const FILTER_HOURS: Record<TimeFilter, number> = {
  "24h": 24,
  "3d": 72,
  "7d": 168,
  "30d": 720,
};

export function filterStormsByTime(
  storms: StormReport[],
  filter: TimeFilter
): StormReport[] {
  const hours = FILTER_HOURS[filter];
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return storms.filter((r) => {
    const t = new Date(`${r.date}T${r.time}:00`).getTime();
    return t >= cutoff;
  });
}
