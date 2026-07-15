import { NextRequest, NextResponse } from "next/server";
import { runStormScan } from "@/lib/scanner/storm-scanner";
import { filterStormsByTime } from "@/lib/time-filter";
import { SAMPLE_STORMS } from "@/lib/sample-data";
import { scoreStorms } from "@/lib/scoring";
import type { TimeFilter } from "@/types/storm";

const VALID: TimeFilter[] = ["24h", "3d", "7d", "30d"];

export async function GET(req: NextRequest) {
  const filter = (req.nextUrl.searchParams.get("filter") || "7d") as TimeFilter;
  const safe = VALID.includes(filter) ? filter : "7d";
  const filtered = filterStormsByTime(SAMPLE_STORMS, safe);
  const scored = scoreStorms(filtered);
  return NextResponse.json({ filter: safe, storms: scored, count: scored.length });
}

export async function POST(req: NextRequest) {
  let filter: TimeFilter = "7d";
  try {
    const body = await req.json();
    if (VALID.includes(body.filter)) filter = body.filter;
  } catch {
    // empty body ok
  }
  const result = await runStormScan(filter);
  const scored = scoreStorms(result.storms);
  return NextResponse.json({ ...result, storms: scored });
}
