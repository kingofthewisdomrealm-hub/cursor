import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "StayFlow",
    version: "1.0.0",
  });
}
