export type AdvisorAnswers = {
  landscape: string;
  dataMaturity: string;
  aiAmbition: string;
  company?: string;
  email?: string;
};

export type GapItem = {
  area: string;
  finding: string;
  severity: "low" | "medium" | "high";
};

export type Lever = {
  title: string;
  description: string;
  expectedImpact: string;
};

export type Scorecard = {
  readinessScore: number;
  executiveSummary: string;
  gapAnalysis: GapItem[];
  levers: Lever[];
};

export type AdvisorResponse = {
  scorecard: Scorecard;
  persisted: boolean;
};
