"use client";

import { useState } from "react";
import { STEPS } from "@/lib/questions";
import type { AdvisorAnswers, Scorecard } from "@/lib/types";

type StepId = (typeof STEPS)[number]["id"];

const SEVERITY_STYLES: Record<string, string> = {
  low: "border-emerald-800 bg-emerald-950/40 text-emerald-300",
  medium: "border-amber-800 bg-amber-950/40 text-amber-300",
  high: "border-red-800 bg-red-950/40 text-red-300",
};

export default function ArchitectureAdvisorForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<StepId, string>>({
    landscape: "",
    dataMaturity: "",
    aiAmbition: "",
  });
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLastStep = step === STEPS.length;
  const current = isLastStep ? null : STEPS[step];
  const currentValue = current ? answers[current.id] : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScorecard(null);

    const payload: AdvisorAnswers = {
      landscape: answers.landscape.trim(),
      dataMaturity: answers.dataMaturity.trim(),
      aiAmbition: answers.aiAmbition.trim(),
      company: company.trim() || undefined,
      email: email.trim() || undefined,
    };

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analyse fehlgeschlagen.");
      if (!data.scorecard) throw new Error("Unerwartete Antwort vom Server.");

      setScorecard(data.scorecard as Scorecard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  if (scorecard) {
    return (
      <div className="w-full max-w-2xl space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold text-cyan-400">Readiness Score</h3>
            <span className="text-3xl font-bold text-white">
              {scorecard.readinessScore}
              <span className="text-base text-zinc-500">/100</span>
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            {scorecard.executiveSummary}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-cyan-400">Gap-Analyse</h3>
          {scorecard.gapAnalysis.map((gap, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 ${
                SEVERITY_STYLES[gap.severity] ?? SEVERITY_STYLES.medium
              }`}
            >
              <div className="text-sm font-medium">{gap.area}</div>
              <p className="mt-1 text-sm opacity-90">{gap.finding}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-cyan-400">Hebel</h3>
          {scorecard.levers.map((lever, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="font-medium text-white">{lever.title}</div>
              <p className="mt-1 text-sm text-zinc-400">{lever.description}</p>
              <p className="mt-2 text-sm text-cyan-400">
                {lever.expectedImpact}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setScorecard(null);
            setStep(0);
          }}
          className="w-full rounded-xl border border-zinc-700 py-3 text-zinc-300 transition hover:bg-zinc-800"
        >
          Neue Analyse starten
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-sm text-zinc-500">
        Schritt {step + 1} von {STEPS.length + 1}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {current ? (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              {current.title}
            </h2>
            <label className="block text-sm text-zinc-400">
              {current.prompt}
            </label>
            <textarea
              rows={5}
              value={currentValue}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [current.id]: e.target.value,
                }))
              }
              placeholder={current.placeholder}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Wohin dürfen wir die Auswertung senden? (optional)
            </h2>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Unternehmen"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl border border-zinc-700 px-6 py-3 text-zinc-300 transition hover:bg-zinc-800"
            >
              Zurück
            </button>
          )}

          {isLastStep ? (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-cyan-600 py-3 font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {loading ? "Analysiere…" : "Audit starten"}
            </button>
          ) : (
            <button
              type="button"
              disabled={!currentValue.trim()}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-xl bg-cyan-600 py-3 font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
            >
              Weiter
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
