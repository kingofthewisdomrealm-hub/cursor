import { NextResponse } from "next/server";
import { INTEGRATION_APPS } from "@/lib/integrations/registry";

export async function GET() {
  return NextResponse.json({
    apps: INTEGRATION_APPS,
    message:
      "Connect AI apps in the Integrations hub. Client-side connections are stored in localStorage.",
  });
}
