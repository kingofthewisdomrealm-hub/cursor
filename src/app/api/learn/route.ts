import { NextRequest, NextResponse } from "next/server";
import { generateLearningUpdate } from "@/lib/ai-planner";

export async function POST(request: NextRequest) {
  try {
    const { outcome, results } = await request.json();

    const update = await generateLearningUpdate(outcome ?? "Mission", results ?? []);

    return NextResponse.json({ update });
  } catch (error) {
    console.error("Learning update error:", error);
    return NextResponse.json({ error: "Failed to generate learning update" }, { status: 500 });
  }
}
