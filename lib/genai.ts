import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function analyzeBaseline(input: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an elite enterprise software architect. Perform an instant baseline architectural audit of the following input (URL, tech stack, code snippet, or prompt). Provide a sharp, concise, high-value executive breakdown: 1. Core Assessment, 2. Key Risks & Bottlenecks, 3. Immediate Actionable Levers. Input:\n\n${input}`,
          },
        ],
      },
    ],
  });

  return response.text;
}
