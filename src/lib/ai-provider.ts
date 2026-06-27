import type { Experiment, Idea, IdeaContext, ModuleKey, Report, ReportSection, Scores, Source } from "@/types/domain";
import { clampScore, nowIso, uid } from "@/lib/utils";

const defaultContext: IdeaContext = {
  geography: "Turkey + EU",
  industry: "SaaS",
  customerSegment: "Early-stage teams",
  model: "B2B",
  stage: "idea",
  founderSkills: "product, sales, no-code",
  budget: "under EUR 5k",
  riskTolerance: "medium",
  language: "tr"
};

export function normalizeContext(input: Partial<IdeaContext>): IdeaContext {
  return {
    geography: input.geography || defaultContext.geography,
    industry: input.industry || defaultContext.industry,
    customerSegment: input.customerSegment || defaultContext.customerSegment,
    model: input.model || defaultContext.model,
    stage: input.stage || defaultContext.stage,
    founderSkills: input.founderSkills || defaultContext.founderSkills,
    budget: input.budget || defaultContext.budget,
    riskTolerance: input.riskTolerance || defaultContext.riskTolerance,
    language: input.language || defaultContext.language
  };
}

export function titleFromDescription(description: string) {
  const cleaned = description.trim().replace(/\s+/g, " ");
  const firstSentence = cleaned.split(/[.!?]/)[0] || cleaned;
  return firstSentence.length > 54 ? `${firstSentence.slice(0, 51)}...` : firstSentence || "Untitled idea";
}

function scoreSeed(description: string) {
  return description.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function buildScores(description: string, context: IdeaContext): Scores {
  const seed = scoreSeed(description);
  const stageBoost = context.stage === "revenue" ? 9 : context.stage === "mvp" ? 6 : context.stage === "scaling" ? 11 : 0;
  const b2bBoost = context.model === "B2B" ? 6 : context.model === "B2B2C" ? 3 : 0;
  const demand = clampScore(58 + (seed % 18) + stageBoost);
  const feasibility = clampScore(62 + ((seed / 3) % 15) + b2bBoost);
  const competition = clampScore(48 + ((seed / 7) % 22));
  const monetization = clampScore(55 + ((seed / 11) % 23) + b2bBoost);
  const founderFit = clampScore(60 + (context.founderSkills.length % 18));
  const risk = clampScore(42 + ((seed / 13) % 26) - (context.riskTolerance === "high" ? 4 : 0));
  return {
    viability: clampScore((demand + feasibility + monetization + founderFit + (100 - competition) + (100 - risk)) / 6),
    confidence: clampScore(68 + description.length / 16 + (context.geography ? 5 : 0)),
    demand,
    feasibility,
    competition,
    monetization,
    founderFit,
    risk
  };
}

function buildSources(context: IdeaContext): Source[] {
  const refreshedAt = nowIso();
  return [
    {
      id: uid("src"),
      title: `${context.geography} search intent and category trend sample`,
      url: "https://trends.google.com",
      kind: "verified",
      confidence: 82,
      refreshedAt
    },
    {
      id: uid("src"),
      title: `${context.industry} competitor and review landscape sample`,
      url: "https://www.producthunt.com",
      kind: "verified",
      confidence: 76,
      refreshedAt
    },
    {
      id: uid("src"),
      title: "Founder-provided positioning, budget and capability inputs",
      kind: "user",
      confidence: 71,
      refreshedAt
    },
    {
      id: uid("src"),
      title: "Model inference from market structure, pricing and execution risk",
      kind: "inference",
      confidence: 69,
      refreshedAt
    }
  ];
}

function section(id: string, title: string, summary: string, bullets: string[], sourceIds: string[], tag: ReportSection["tag"]): ReportSection {
  return { id, title, summary, bullets, sourceIds, tag };
}

export function generateValidationReport(idea: Pick<Idea, "id" | "description" | "context" | "reports">): Report {
  const scores = buildScores(idea.description, idea.context);
  const sources = buildSources(idea.context);
  const verified = sources.filter((source) => source.kind === "verified").map((source) => source.id);
  const userSource = sources.find((source) => source.kind === "user")?.id ?? sources[0].id;
  const inference = sources.find((source) => source.kind === "inference")?.id ?? sources[0].id;
  const version = idea.reports.length + 1;

  const executiveSummary =
    `${idea.description.trim()} fikri ${idea.context.geography} pazarinda ${scores.viability}/100 viability skoru aliyor. ` +
    `En guclu taraf ${scores.demand >= scores.feasibility ? "talep sinyali" : "uygulanabilirlik"}; en dikkat isteyen alan rekabet ve kanit toplama disiplini.`;

  const sections: ReportSection[] = [
    section(
      uid("sec"),
      "Validation Summary",
      "Karar dosyasi fikrin talep, rekabet, uygulanabilirlik ve founder-fit tarafini birlikte okur.",
      [
        `Viability ${scores.viability}/100, confidence ${scores.confidence}/100.`,
        `${idea.context.customerSegment} icin ilk wedge netlestirilmeli.`,
        `${idea.context.budget} butce ile en dogru baslangic dusuk maliyetli talep testi.`
      ],
      [userSource, inference],
      "inference"
    ),
    section(
      uid("sec"),
      "Market & Demand Signals",
      "Pazar sinyalleri pozitif ama iddialar gercek musteri davranisi ile dogrulanmali.",
      [
        `${idea.context.industry} kategorisinde alternatif arayisi ve arac yorgunlugu mesajlasma acisi yaratir.`,
        `${idea.context.geography} icin lokal kanal ve fiyat hassasiyeti raporda ayrica takip edilmeli.`,
        "Ilk 20 discovery gorusmesi rapor confidence skorunu anlamli sekilde artirir."
      ],
      verified,
      "verified"
    ),
    section(
      uid("sec"),
      "Competitive Landscape",
      "Rakip yogunlugu tek basina stop sinyali degil; pozisyonlama acikliginin kanitlanmasi gerekir.",
      [
        "Horizontal rakiplerle kafa kafaya girilmemeli.",
        `${idea.context.customerSegment} icin dar bir operasyonel problem secilmeli.`,
        "Fiyat, onboarding hizi ve guven kaniti erken farklastirici olabilir."
      ],
      verified,
      "verified"
    ),
    section(
      uid("sec"),
      "Financials & Unit Economics",
      "Finansal model ilk asamada varsayim odaklidir; CAC, conversion ve churn araliklari ile simulasyon yapilmali.",
      [
        "Baslangic ARPA varsayimi dusuk, expansion varsayimi ayrica test edilmeli.",
        "Break-even icin ilk 90 gunde kanal basina CAC ogrenimi hedeflenmeli.",
        "Yuksek gross margin ancak destek maliyeti kontrol edilirse korunur."
      ],
      [inference],
      "inference"
    ),
    section(
      uid("sec"),
      "Roadmap, Risk & Execution",
      "MVP, tek persona ve tek use-case uzerinden kanit toplamalidir.",
      [
        "Hafta 1: landing + waitlist + 15 interview.",
        "Hafta 2: concierge MVP ve fiyat testi.",
        "Hafta 3-4: ilk odemeli pilot, risk log'u ve karar toplantisi."
      ],
      [userSource, inference],
      "inference"
    )
  ];

  return {
    id: uid("report"),
    ideaId: idea.id,
    version,
    createdAt: nowIso(),
    scores,
    executiveSummary,
    goSignals: [
      `Net bir ${idea.context.customerSegment} segmenti secilmis.`,
      `${idea.context.model} modelinde monetizasyon daha erken test edilebilir.`,
      "Founder-fit skoru ilk MVP icin yeterli gorunuyor."
    ],
    stopSignals: [
      "Kanit olmadan pazar buyuklugu iddiasi yatirimci sunumunda zayif kalir.",
      "Rakip yogunlugu positioning net degilse CAC'i yukseltebilir.",
      "Regulasyon veya veri guveni ihtiyaci erken cozume dahil edilmeli."
    ],
    nextActions: [
      "20 hedef musteri gorusmesi planla.",
      "Tek problem icin smoke-test landing yayinla.",
      "3 fiyat paketi ile willingness-to-pay testi yap.",
      "Rakiplerden farkli bir kategori cumlesi yaz.",
      "Ilk MVP scope'unu 2 haftalik concierge deneyine indir."
    ],
    sources,
    sections
  };
}

export function generateExperiments(ideaId: string): Experiment[] {
  const createdAt = nowIso();
  return [
    {
      id: uid("exp"),
      ideaId,
      title: "Problem intensity interviews",
      riskLevel: "high",
      evidenceRequired: "At least 12 of 20 target users describe the problem as urgent.",
      suggestedExperiment: "Run structured 30-minute discovery calls with ICP candidates.",
      cost: "EUR 0-150",
      duration: "5 days",
      successThreshold: "60% urgent-pain confirmation",
      owner: "Founder",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Smoke-test landing conversion",
      riskLevel: "medium",
      evidenceRequired: "Visitor to waitlist conversion rate with a clear offer.",
      suggestedExperiment: "Launch one-page landing with two value propositions and track CTA clicks.",
      cost: "EUR 50-250",
      duration: "7 days",
      successThreshold: "8%+ waitlist conversion",
      owner: "Growth",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Willingness-to-pay test",
      riskLevel: "high",
      evidenceRequired: "Prospects accept a paid pilot or pre-order.",
      suggestedExperiment: "Offer 3 pilot packages after interviews.",
      cost: "EUR 0",
      duration: "10 days",
      successThreshold: "3 paid commitments",
      owner: "Founder",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Competitive switching proof",
      riskLevel: "medium",
      evidenceRequired: "Users explain why current alternatives fail.",
      suggestedExperiment: "Collect 25 competitor review snippets and 10 switcher interviews.",
      cost: "EUR 0-100",
      duration: "4 days",
      successThreshold: "3 repeated unmet needs",
      owner: "Research",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Concierge MVP delivery",
      riskLevel: "high",
      evidenceRequired: "Manual service produces measurable customer value.",
      suggestedExperiment: "Deliver the solution manually for 2 pilot customers before building software.",
      cost: "EUR 100-500",
      duration: "14 days",
      successThreshold: "2 pilots complete and 1 renewal intent",
      owner: "Product",
      status: "to_validate",
      evidence: [],
      createdAt
    }
  ];
}

export function createModulePreview(module: ModuleKey, idea: Idea) {
  const common = {
    ideaId: idea.id,
    module,
    generatedAt: nowIso()
  };
  if (module === "market") {
    return {
      ...common,
      title: "Market Analysis",
      bullets: ["TAM/SAM/SOM ranges", "Demand channels", "Competitor map", "Pricing benchmarks"]
    };
  }
  if (module === "businessPlan") {
    return {
      ...common,
      title: "Investor-Ready Business Plan",
      bullets: ["Executive summary", "GTM plan", "36-month projection", "Funding ask"]
    };
  }
  if (module === "brand") {
    return {
      ...common,
      title: "Brand Strategy",
      bullets: ["Positioning", "Archetype", "Messaging pillars", "Objection handling"]
    };
  }
  if (module === "visual") {
    return {
      ...common,
      title: "Visual Identity",
      bullets: ["Logo prompts", "Palette", "Typography", "Landing hero direction"]
    };
  }
  return {
    ...common,
    title: "Marketing Suite",
    bullets: ["Meta ads", "LinkedIn ads", "Email sequence", "UGC scripts", "Launch checklist"]
  };
}
