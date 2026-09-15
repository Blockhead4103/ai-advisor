import { NextResponse } from "next/server";
import { analyzeBaseline } from "@/lib/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Input prompt is required." }, { status: 400 });
    }

    const analysis = await analyzeBaseline(prompt);

    return NextResponse.json({
      scorecard: {
        executiveSummary: analysis,
      },
      persisted: false,
    });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate baseline audit." },
      { status: 500 }
    );
  }
}
