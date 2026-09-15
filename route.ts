import { NextResponse } from "next/server";
import { generateScorecard } from "@/lib/genai";
import { persistLead } from "@/lib/supabase";
import type { AdvisorAnswers } from "@/lib/types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AdvisorAnswers>;

    if (
      !isNonEmptyString(body.landscape) ||
      !isNonEmptyString(body.dataMaturity) ||
      !isNonEmptyString(body.aiAmbition)
    ) {
      return NextResponse.json(
        { error: "Bitte alle drei Architektur-Fragen beantworten." },
        { status: 400 },
      );
    }

    const answers: AdvisorAnswers = {
      landscape: body.landscape.trim(),
      dataMaturity: body.dataMaturity.trim(),
      aiAmbition: body.aiAmbition.trim(),
      company: isNonEmptyString(body.company) ? body.company.trim() : undefined,
      email: isNonEmptyString(body.email) ? body.email.trim() : undefined,
    };

    const scorecard = await generateScorecard(answers);

    let persisted = false;
    try {
      persisted = await persistLead(answers, scorecard);
    } catch (persistError) {
      console.error("[/api/advisor] persist", persistError);
    }

    return NextResponse.json({ scorecard, persisted });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("[/api/advisor]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
