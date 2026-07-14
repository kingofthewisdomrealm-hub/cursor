import { NextResponse } from "next/server";

const REALTIME_MODEL = "gpt-realtime-2.1";
const DEFAULT_VOICE = "marin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing OPENAI_API_KEY. Add it to .env.local on the server, then restart npm run dev.",
      },
      { status: 500 },
    );
  }

  let voice = DEFAULT_VOICE;

  try {
    const body = (await request.json()) as { voice?: string };
    if (typeof body.voice === "string" && body.voice.trim()) {
      voice = body.voice.trim();
    }
  } catch {
    // Optional body — defaults are fine.
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: REALTIME_MODEL,
            audio: {
              output: {
                voice,
              },
            },
          },
        }),
      },
    );

    const data = (await response.json()) as {
      value?: string;
      error?: { message?: string };
      session?: unknown;
    };

    if (!response.ok || !data.value) {
      const message =
        data.error?.message ||
        `OpenAI rejected the session request (${response.status}). Check your API key and Realtime access.`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    // Only return the ephemeral client secret — never the permanent API key.
    return NextResponse.json({
      client_secret: data.value,
      model: REALTIME_MODEL,
    });
  } catch (error) {
    console.error("Failed to mint Realtime client secret:", error);
    return NextResponse.json(
      {
        error:
          "Could not reach OpenAI to create a temporary session. Check your network connection and try again.",
      },
      { status: 502 },
    );
  }
}
