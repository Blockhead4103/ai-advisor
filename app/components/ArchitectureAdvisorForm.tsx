"use client";

import { useState } from "react";

export default function ArchitectureAdvisorForm() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");

      setResult(data.scorecard?.executiveSummary || JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Gib eine URL, einen Tech-Stack oder einen Code-Schnipsel ein:
          </label>
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="z.B. Next.js 16 App Router mit Supabase und Tailwind..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full rounded-xl bg-cyan-600 py-3 font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? "Analysiere Baseline..." : "Sofort-Audit starten"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h3 className="font-semibold text-cyan-400">Baseline Audit Ergebnis</h3>
          <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}
