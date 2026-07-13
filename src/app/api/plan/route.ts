import { NextRequest, NextResponse } from "next/server";
import { generateMissionPlan } from "@/lib/ai-planner";

export async function POST(request: NextRequest) {
  try {
    const { outcome, answers } = await request.json();

    if (!outcome?.trim()) {
      return NextResponse.json({ error: "Outcome is required" }, { status: 400 });
    }

    const plan = await generateMissionPlan(outcome.trim(), answers ?? {});

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
