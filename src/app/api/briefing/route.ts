import { NextRequest, NextResponse } from "next/server";
import { generateDailyBriefing } from "@/lib/ai-planner";

export async function POST(request: NextRequest) {
  try {
    const { missionTitle, tasks, progress, target } = await request.json();

    const briefing = await generateDailyBriefing(
      missionTitle ?? "Mission",
      tasks ?? [],
      progress ?? 0,
      target ?? 10
    );

    return NextResponse.json({ briefing });
  } catch (error) {
    console.error("Briefing error:", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
