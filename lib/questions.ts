export const STEPS = [
  {
    id: "landscape" as const,
    title: "Architektur-Landschaft",
    prompt:
      "Wie ist Ihre aktuelle Systemlandschaft aufgebaut? (z. B. Monolith vs. Microservices, Cloud vs. On-Prem, Kernsysteme, Integrationsmuster)",
    placeholder:
      "Beispiel: Hybrider Stack mit SAP und einem zentralen Monolithen, erste Services in Azure, Batch-Integrationen über Dateien…",
  },
  {
    id: "dataMaturity" as const,
    title: "Daten- & Integrationsreife",
    prompt:
      "Wie reif sind Datenqualität, APIs und Observability? Wo liegen die größten Reibungsverluste zwischen Systemen und Teams?",
    placeholder:
      "Beispiel: Kein einheitliches Datenmodell, APIs nur intern, Logging je Team unterschiedlich, Stammdaten in mehreren Quellen…",
  },
  {
    id: "aiAmbition" as const,
    title: "KI-Ziele & Governance",
    prompt:
      "Welche KI- oder Automatisierungsziele verfolgen Sie in den nächsten 12 Monaten – und welche Governance-, Skill- oder Compliance-Grenzen gelten?",
    placeholder:
      "Beispiel: Copiloten für den Vertrieb, Dokumentenextraktion, aber keine Daten dürfen die EU verlassen; internes Team ist klein…",
  },
] as const;
