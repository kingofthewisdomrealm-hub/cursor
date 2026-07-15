import { v4 as uuidv4 } from "uuid";
import { getEnabledSources, listDataSourceMeta } from "@/lib/data-sources";
import { scoreStorms } from "@/lib/scoring";
import { FILTER_HOURS, filterStormsByTime } from "@/lib/time-filter";
import type {
  AgentActivityEntry,
  ScanResult,
  StormReport,
  TimeFilter,
} from "@/types/storm";

function entry(
  type: AgentActivityEntry["type"],
  message: string,
  source?: string,
  details?: string
): AgentActivityEntry {
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    type,
    message,
    source,
    details,
  };
}

/**
 * Storm scanner — gathers reports from enabled modular data sources.
 * MVP uses sample data; stubs are ready for NWS, airports, and local news.
 */
export async function runStormScan(
  filter: TimeFilter = "7d"
): Promise<ScanResult> {
  const sinceHours = FILTER_HOURS[filter];
  const activity: AgentActivityEntry[] = [];
  const allReports: StormReport[] = [];
  const websites = new Set<string>();
  let errors = 0;
  let opportunitiesCreated = 0;

  activity.push(
    entry(
      "scan_start",
      `Storm scan started (window: ${filter}, ${sinceHours}h)`,
      "scanner"
    )
  );

  const sources = getEnabledSources();
  if (sources.length === 0) {
    activity.push(
      entry("error", "No enabled data sources", "scanner", "Enable at least one source in the registry")
    );
    errors += 1;
  }

  for (const source of sources) {
    activity.push(
      entry(
        "website_checked",
        `Checking source: ${source.meta.name}`,
        source.meta.id
      )
    );

    try {
      const result = await source.fetchReports({ sinceHours });
      result.websitesChecked.forEach((w) => websites.add(w));
      for (const site of result.websitesChecked) {
        activity.push(
          entry("website_checked", `Fetched ${site}`, source.meta.id)
        );
      }
      for (const err of result.errors) {
        errors += 1;
        activity.push(entry("error", err, source.meta.id));
      }
      for (const report of result.reports) {
        allReports.push(report);
        activity.push(
          entry(
            "report_found",
            `${report.type} in ${report.city}, ${report.zipCode}`,
            source.meta.id,
            report.description
          )
        );
      }
    } catch (e) {
      errors += 1;
      activity.push(
        entry(
          "error",
          e instanceof Error ? e.message : "Unknown source error",
          source.meta.id
        )
      );
    }
  }

  // Dedupe by id
  const byId = new Map<string, StormReport>();
  for (const r of allReports) byId.set(r.id, r);
  const unique = Array.from(byId.values());

  const scored = scoreStorms(unique);
  for (const s of scored.filter((x) => x.opportunityScore >= 60)) {
    opportunitiesCreated += 1;
    activity.push(
      entry(
        "opportunity_created",
        `Opportunity score ${s.opportunityScore} — ${s.city} ${s.type}`,
        "scoring",
        s.id
      )
    );
  }

  activity.push(
    entry(
      "scan_complete",
      `Scan complete: ${websites.size} sources/sites, ${unique.length} reports, ${opportunitiesCreated} opportunities, ${errors} errors`,
      "scanner"
    )
  );

  return {
    scannedAt: new Date().toISOString(),
    websitesChecked: websites.size,
    reportsFound: unique.length,
    opportunitiesCreated,
    errors,
    storms: unique,
    activity,
  };
}

export { FILTER_HOURS, filterStormsByTime, listDataSourceMeta };
