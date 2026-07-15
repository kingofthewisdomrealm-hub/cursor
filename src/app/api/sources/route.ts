import { NextResponse } from "next/server";
import { listDataSourceMeta } from "@/lib/data-sources";

export async function GET() {
  return NextResponse.json({ sources: listDataSourceMeta() });
}
