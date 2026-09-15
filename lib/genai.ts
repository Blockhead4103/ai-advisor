import { GoogleGenAI } from "@google/genai";
import type { AdvisorAnswers, Scorecard } from "@/lib/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeBaseline(input: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: input,
  });
  return response.text || "No response generated.";
}

function buildScorecardPrompt(answers: AdvisorAnswers): string {
  return `Du bist ein Architektur- und KI-Readiness-Berater. Bewerte die
folgende Organisation und gib AUSSCHLIESSLICH ein JSON-Objekt zurück.
Kein Fliesstext, keine Markdown-Fences.

Architektur-Landschaft: ${answers.landscape}
Daten- & Integrationsreife: ${answers.dataMaturity}
KI-Ziele & Governance: ${answers.aiAmbition}

Schema:
{
  "readinessScore": number (0-100),
  "executiveSummary": string (2-4 Sätze),
  "gapAnalysis": [{ "area": string, "finding": string,
                    "severity": "low" | "medium" | "high" }],
  "levers": [{ "title": string, "description": string,
               "expectedImpact": string }]
}

Liefere 3-5 Gaps und 3-4 Hebel. Antworte auf Deutsch.`;
}

function parseScorecard(raw: string): Scorecard {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  const s = parsed as Partial<Scorecard>;
  const severities = ["low", "medium", "high"];

  if (
    typeof s.readinessScore !== "number" ||
    typeof s.executiveSummary !== "string" ||
    !Array.isArray(s.gapAnalysis) ||
    !Array.isArray(s.levers) ||
    !s.gapAnalysis.every((g) => severities.includes(g?.severity))
  ) {
    throw new Error("Model response did not match the Scorecard schema.");
  }

  return {
    readinessScore: Math.max(0, Math.min(100, Math.round(s.readinessScore))),
    executiveSummary: s.executiveSummary,
    gapAnalysis: s.gapAnalysis,
    levers: s.levers,
  };
}

export async function generateScorecard(
  answers: AdvisorAnswers,
): Promise<Scorecard> {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: buildScorecardPrompt(answers),
  });
  return parseScorecard(response.text || "");
}
