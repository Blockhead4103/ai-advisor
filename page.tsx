import ArchitectureAdvisorForm from "./components/ArchitectureAdvisorForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
        <div className="mb-12 max-w-2xl space-y-4">
          <p className="text-sm font-medium tracking-wide text-cyan-700 uppercase dark:text-cyan-400">
            AI Architecture Advisor
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Drei Fragen. Eine Scorecard für Ihre KI-Architektur.
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Gemini 2.5 Pro bewertet Landschaft, Datenreife und KI-Ambition und
            liefert Readiness Score, Executive Summary, Gap Analysis und drei
            konkrete Hebel.
          </p>
        </div>
        <ArchitectureAdvisorForm />
      </main>
    </div>
  );
}
