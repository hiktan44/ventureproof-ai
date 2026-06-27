export type ModuleKey =
  | "validation"
  | "market"
  | "businessPlan"
  | "brand"
  | "visual"
  | "marketing";

export type ModuleStatus = "locked" | "ready" | "generating" | "complete" | "failed";

export type SourceKind = "verified" | "inference" | "user";

export type ExperimentStatus = "to_validate" | "in_progress" | "confirmed" | "false";

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  credits: number;
  createdAt: string;
};

export type CreditLedgerEntry = {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  ideaId?: string;
  createdAt: string;
};

export type IdeaContext = {
  geography: string;
  industry: string;
  customerSegment: string;
  model: "B2B" | "B2C" | "B2B2C";
  stage: "idea" | "mvp" | "revenue" | "scaling";
  founderSkills: string;
  budget: string;
  riskTolerance: "low" | "medium" | "high";
  language: "tr" | "en";
};

export type Source = {
  id: string;
  title: string;
  url?: string;
  kind: SourceKind;
  confidence: number;
  refreshedAt: string;
};

export type ReportSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  sourceIds: string[];
  tag: SourceKind;
};

export type Scores = {
  viability: number;
  confidence: number;
  demand: number;
  feasibility: number;
  competition: number;
  monetization: number;
  founderFit: number;
  risk: number;
};

export type Experiment = {
  id: string;
  ideaId: string;
  title: string;
  riskLevel: "low" | "medium" | "high";
  evidenceRequired: string;
  suggestedExperiment: string;
  cost: string;
  duration: string;
  successThreshold: string;
  owner: string;
  status: ExperimentStatus;
  evidence: string[];
  createdAt: string;
};

export type Report = {
  id: string;
  ideaId: string;
  version: number;
  createdAt: string;
  scores: Scores;
  executiveSummary: string;
  goSignals: string[];
  stopSignals: string[];
  nextActions: string[];
  sources: Source[];
  sections: ReportSection[];
};

export type ModuleOutput = {
  id: string;
  ideaId: string;
  module: Exclude<ModuleKey, "validation">;
  title: string;
  generatedAt: string;
  summary: string;
  bullets: string[];
  artifacts: {
    label: string;
    value: string;
  }[];
  sourceIds: string[];
};

export type Idea = {
  id: string;
  userId: string;
  title: string;
  description: string;
  context: IdeaContext;
  modules: Record<ModuleKey, ModuleStatus>;
  reports: Report[];
  moduleOutputs: Partial<Record<Exclude<ModuleKey, "validation">, ModuleOutput>>;
  experiments: Experiment[];
  createdAt: string;
  updatedAt: string;
};

export type ShareLink = {
  id: string;
  ideaId: string;
  userId: string;
  token: string;
  createdAt: string;
};

export type Database = {
  users: User[];
  ideas: Idea[];
  creditLedger: CreditLedgerEntry[];
  shareLinks: ShareLink[];
};

export const moduleCosts: Record<ModuleKey, number> = {
  validation: 40,
  market: 100,
  businessPlan: 120,
  brand: 60,
  visual: 160,
  marketing: 250
};

export const moduleLabels: Record<ModuleKey, string> = {
  validation: "Idea Validation",
  market: "Market Analysis",
  businessPlan: "Business Plan",
  brand: "Brand Strategy",
  visual: "Visual Identity",
  marketing: "Marketing Suite"
};
