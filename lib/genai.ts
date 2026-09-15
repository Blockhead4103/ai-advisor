import { GoogleGenAI } from "@google/genai";
import type { AdvisorAnswers, Scorecard } from "./types";

const SCORECARD_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["readinessScore", "executiveSummary", "gapAnalysis", "levers"],
  properties: {
    readinessScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Architecture / AI readiness score from 0 to 100.",
    },
    executiveSummary: {
      type: "string",
      description: "2–4 sentences for executives in German.",
    },
    gapAnalysis: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["area", "finding", "severity"],
        properties: {
          area: { type: "string" },
          finding: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
    levers: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "expectedImpact"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          expectedImpact: { type: "string" },
        },
      },
    },
  },
} as const;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY (oder GOOGLE_API_KEY) ist nicht gesetzt.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateScorecard(
  answers: AdvisorAnswers,
): Promise<Scorecard> {
  const ai = getClient();
  const prompt = [
    "Du bist ein Principal Enterprise Architect.",
    "Bewerte die Architektur-Reife für KI-Initiativen anhand der drei Antworten.",
    "Antworte ausschließlich als JSON gemäß Schema.",
    "Sprache: Deutsch, klar, konkret, ohne Marketing-Floskeln.",
    "",
    `1) Architektur-Landschaft:\n${answers.landscape}`,
    `2) Daten- & Integrationsreife:\n${answers.dataMaturity}`,
    `3) KI-Ziele & Governance:\n${answers.aiAmbition}`,
  ].join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: SCORECARD_SCHEMA,
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini hat keine Scorecard geliefert.");
  }

  const parsed = JSON.parse(text) as Scorecard;
  if (
    typeof parsed.readinessScore !== "number" ||
    !parsed.executiveSummary ||
    !Array.isArray(parsed.gapAnalysis) ||
    !Array.isArray(parsed.levers)
  ) {
    throw new Error("Scorecard-JSON ist unvollständig.");
  }

  return parsed;
}
