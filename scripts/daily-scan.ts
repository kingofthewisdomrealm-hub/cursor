/**
 * Standalone scheduled scan runner.
 * Usage: npx tsx scripts/daily-scan.ts
 * Or wire to system cron / GitHub Actions.
 */
import { runStormScan } from "../src/lib/scanner/storm-scanner";
import { formatDailyReport } from "../src/lib/daily-report";

async function main() {
  console.log("[SOA] Starting scheduled storm scan…");
  const result = await runStormScan("30d");
  const report = formatDailyReport(result.storms);

  console.log(
    JSON.stringify(
      {
        scannedAt: result.scannedAt,
        websitesChecked: result.websitesChecked,
        reportsFound: result.reportsFound,
        opportunitiesCreated: result.opportunitiesCreated,
        errors: result.errors,
        dailySummary: report.summary,
        top: report.top.map((t) => ({
          city: t.city,
          type: t.type,
          score: t.opportunityScore,
          zip: t.zipCode,
        })),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("[SOA] Scan failed", err);
  process.exit(1);
});
