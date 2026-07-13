import { NextResponse } from "next/server";

const DEMO_SUGGESTIONS = [
  "Close-up photos of hail impacts on all roof slopes",
  "Attic inspection photos showing decking damage",
  "Moisture meter readings for interior water damage",
  "Contractor estimate with full scope breakdown",
  "NWS storm verification report for date of loss",
  "Before/after photos of gutter and downspout damage",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { photoCount, categories } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a damage assessment expert. Given claim photo info, suggest additional documentation needed. Return JSON with 'suggestions' array of strings.",
            },
            {
              role: "user",
              content: `Claim has ${photoCount || 0} photos. Categories found: ${(categories || []).join(", ") || "none"}. What additional documentation is needed?`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.suggestions?.length > 0) {
            return NextResponse.json({ suggestions: parsed.suggestions });
          }
        }
      } catch {
        // Fall through
      }
    }

    const count = Math.min(photoCount || 3, DEMO_SUGGESTIONS.length);
    return NextResponse.json({
      suggestions: DEMO_SUGGESTIONS.slice(0, count),
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
