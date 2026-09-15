import ArchitectureAdvisorForm from "@/app/components/ArchitectureAdvisorForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="w-full max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Executive Platform Architecture Advisor</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Evaluate your platform readiness, data maturity, and AI integration roadmap.
          </p>
        </header>
        <ArchitectureAdvisorForm />
      </div>
    </main>
  );
}
