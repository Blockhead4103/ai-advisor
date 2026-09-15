"use client";

import { useMemo, useState } from "react";
import { STEPS } from "@/lib/questions";
import type { AdvisorAnswers, AdvisorResponse, Scorecard } from "@/lib/types";

const emptyAnswers: AdvisorAnswers = {
  landscape: "",
  dataMaturity: "",
  aiAmbition: "",
  company: "",
  email: "",
};

const severityLabel: Record<Scorecard["gapAnalysis"][number]["severity"], string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

export default function ArchitectureAdvisorForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AdvisorAnswers>(emptyAnswers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdvisorResponse | null>(null);

  const current = STEPS[step];
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  function updateField<K extends keyof AdvisorAnswers>(
    key: K,
    value: AdvisorAnswers[K],
  ) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const currentValue = answers[current.id] ?? "";
  const canContinue = currentValue.trim().length >= 20;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const payload = (await response.json()) as AdvisorResponse & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Anfrage fehlgeschlagen.");
      }
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const { scorecard, persisted } = result;
    return (
      <section className="w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium tracking-wide text-cyan-700 uppercase dark:text-cyan-400">
            Architecture Scorecard
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Readiness Score: {scorecard.readinessScore}/100
          </h2>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-cyan-600"
              style={{ width: `${scorecard.readinessScore}%` }}
            />
          </div>
          {!persisted && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Ergebnis erzeugt, aber nicht in Supabase gespeichert (ENV prüfen).
            </p>
          )}
        </header>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-lg font-semibold">Executive Summary</h3>
          <p className="leading-7 text-zinc-700 dark:text-zinc-300">
            {scorecard.executiveSummary}
          </p>
        </article>

        <article className="space-y-4">
          <h3 className="text-lg font-semibold">Gap Analysis</h3>
          <ul className="space-y-3">
            {scorecard.gapAnalysis.map((gap) => (
              <li
                key={`${gap.area}-${gap.finding}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium">{gap.area}</p>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium dark:bg-zinc-800">
                    {severityLabel[gap.severity]}
                  </span>
                </div>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {gap.finding}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-y-4">
          <h3 className="text-lg font-semibold">3 Hebel</h3>
          <ol className="space-y-3">
            {scorecard.levers.map((lever, index) => (
              <li
                key={lever.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="mb-1 text-sm font-medium text-cyan-700 dark:text-cyan-400">
                  Hebel {index + 1}
                </p>
                <p className="font-semibold">{lever.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {lever.description}
                </p>
                <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-200">
                  Wirkung: {lever.expectedImpact}
                </p>
              </li>
            ))}
          </ol>
        </article>

        <button
          type="button"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          onClick={() => {
            setResult(null);
            setStep(0);
            setAnswers(emptyAnswers);
          }}
        >
          Neue Bewertung
        </button>
      </section>
    );
  }

  return (
    <form
      className="w-full max-w-3xl space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (step < STEPS.length - 1) {
          if (canContinue) setStep((s) => s + 1);
          return;
        }
        if (canContinue) void submit();
      }}
    >
      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
          <span>
            Schritt {step + 1} von {STEPS.length}
          </span>
          <span>{current.title}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-cyan-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-2xl font-semibold tracking-tight">
          {current.prompt}
        </legend>
        <textarea
          required
          minLength={20}
          rows={8}
          value={currentValue}
          onChange={(event) => updateField(current.id, event.target.value)}
          placeholder={current.placeholder}
          className="w-full resize-y rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base leading-7 outline-none ring-cyan-600/30 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="text-sm text-zinc-500">
          Mindestens 20 Zeichen, damit die Bewertung belastbar bleibt.
        </p>
      </fieldset>

      {step === STEPS.length - 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Unternehmen (optional)</span>
            <input
              type="text"
              value={answers.company ?? ""}
              onChange={(event) => updateField("company", event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none ring-cyan-600/30 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">E-Mail (optional)</span>
            <input
              type="email"
              value={answers.email ?? ""}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none ring-cyan-600/30 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 0 || loading}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-zinc-600 disabled:opacity-40 dark:text-zinc-300"
        >
          Zurück
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="submit"
            disabled={!canContinue}
            className="rounded-full bg-zinc-950 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-zinc-950"
          >
            Weiter
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canContinue || loading}
            className="rounded-full bg-cyan-700 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "Scorecard wird erstellt…" : "Scorecard anfordern"}
          </button>
        )}
      </div>
    </form>
  );
}
