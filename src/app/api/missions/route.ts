import { NextRequest, NextResponse } from "next/server";
import { generateClarifyingQuestions } from "@/lib/ai-planner";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { outcome } = await request.json();

    if (!outcome?.trim()) {
      return NextResponse.json({ error: "Outcome is required" }, { status: 400 });
    }

    const questions = await generateClarifyingQuestions(outcome.trim());
    const missionId = uuidv4();

    return NextResponse.json({
      missionId,
      outcome: outcome.trim(),
      questions: questions.map((q, i) => ({
        id: uuidv4(),
        question: q,
        sort_order: i,
        required: true,
      })),
    });
  } catch (error) {
    console.error("Mission create error:", error);
    return NextResponse.json({ error: "Failed to create mission" }, { status: 500 });
  }
}
