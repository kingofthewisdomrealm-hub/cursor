import { NextResponse } from "next/server";
import { analyzeSupplementsDemo } from "@/lib/supplement-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { claimId, hasCarrierEstimate, hasContractorEstimate, hasPhotos, notes } = body;

    if (!claimId) {
      return NextResponse.json({ error: "claimId is required" }, { status: 400 });
    }

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
              content: `You are an expert public adjuster supplement analyst. Analyze insurance claims and identify missing line items. Return JSON array of objects with: lineItem, reason, category (roofing|water_mitigation|interior|code|general), estimatedValue (number), confidence (0-100), codeReference (optional string). Focus on commonly missed items like starter strip, drip edge, ice barrier, valley metal, flashing, vent replacement, permit fees, dumpster, detach/reset, paint matching, texture matching, insulation, drywall.`,
            },
            {
              role: "user",
              content: `Analyze this claim for supplement opportunities. Has carrier estimate: ${hasCarrierEstimate}. Has contractor estimate: ${hasContractorEstimate}. Has photos: ${hasPhotos}. Notes: ${notes || "None"}`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const items = (parsed.items || parsed.supplements || parsed.opportunities || []).map(
            (item: Record<string, unknown>, i: number) => ({
              id: `sup-ai-${Date.now()}-${i}`,
              claimId,
              lineItem: item.lineItem as string,
              reason: item.reason as string,
              category: item.category as string,
              estimatedValue: item.estimatedValue as number,
              confidence: item.confidence as number,
              status: "pending",
              supportingPhotoIds: [],
              supportingDocIds: [],
              codeReference: item.codeReference as string | undefined,
            })
          );
          if (items.length > 0) {
            return NextResponse.json({ supplements: items });
          }
        }
      } catch {
        // Fall through to demo
      }
    }

    const supplements = analyzeSupplementsDemo({
      claimId,
      hasCarrierEstimate: !!hasCarrierEstimate,
      hasContractorEstimate: !!hasContractorEstimate,
      hasPhotos: !!hasPhotos,
      notes: notes || "",
    });

    return NextResponse.json({ supplements });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
