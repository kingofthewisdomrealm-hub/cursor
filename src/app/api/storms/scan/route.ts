import { NextRequest, NextResponse } from "next/server";
import { runStormScan } from "@/lib/scanner/storm-scanner";
import { scoreStorms } from "@/lib/scoring";
import type { TimeFilter } from "@/types/storm";

/**
 * Trigger a storm scan (used by UI "Run Storm Scan" and cron).
 * POST /api/storms/scan  { filter?: "24h"|"3d"|"7d"|"30d" }
 */
export async function POST(req: NextRequest) {
  let filter: TimeFilter = "7d";
  try {
    const body = await req.json();
    if (["24h", "3d", "7d", "30d"].includes(body?.filter)) {
      filter = body.filter;
    }
  } catch {
    // default
  }

  const result = await runStormScan(filter);
  return NextResponse.json({
    ...result,
    storms: scoreStorms(result.storms),
  });
}
