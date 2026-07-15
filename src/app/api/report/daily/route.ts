import { NextResponse } from "next/server";
import { SAMPLE_STORMS } from "@/lib/sample-data";
import { formatDailyReport } from "@/lib/daily-report";

export async function GET() {
  const report = formatDailyReport(SAMPLE_STORMS);
  return NextResponse.json(report);
}
