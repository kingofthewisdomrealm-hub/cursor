import { NextRequest, NextResponse } from "next/server";
import { runStormScan } from "@/lib/scanner/storm-scanner";
import { scoreStorms } from "@/lib/scoring";
import { formatDailyReport } from "@/lib/daily-report";
import { listDataSourceMeta } from "@/lib/data-sources";

/**
 * Scheduled background job endpoint for daily storm scans.
 * Protect with CRON_SECRET in production (Authorization: Bearer <secret>).
 *
 * Example cron (vercel.json):
 *   { "path": "/api/cron/scan", "schedule": "0 12 * * *" }
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runStormScan("30d");
  const scored = scoreStorms(result.storms);
  const report = formatDailyReport(result.storms);

  return NextResponse.json({
    ok: true,
    job: "daily-storm-scan",
    scannedAt: result.scannedAt,
    websitesChecked: result.websitesChecked,
    reportsFound: result.reportsFound,
    opportunitiesCreated: result.opportunitiesCreated,
    errors: result.errors,
    topOpportunities: report.top,
    dailySummary: report.summary,
    sources: listDataSourceMeta(),
    activity: result.activity,
    storms: scored,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
