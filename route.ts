import { NextResponse } from "next/server";
import { analyzeBaseline } from "@/lib/genai";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const analysis = await analyzeBaseline(prompt);

    return NextResponse.json({
      scorecard: { executiveSummary: analysis },
      persisted: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
