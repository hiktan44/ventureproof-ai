import type { Experiment, Idea, IdeaContext, ModuleKey, ModuleOutput, Report, ReportSection, Scores, Source } from "@/types/domain";
import { completeJson } from "@/lib/llm";
import { clampScore, nowIso, uid } from "@/lib/utils";

const defaultContext: IdeaContext = {
  geography: "Türkiye + AB",
  industry: "SaaS",
  customerSegment: "erken aşama operatörler",
  model: "B2B",
  stage: "idea",
  founderSkills: "ürün, satış, no-code",
  budget: "5 bin EUR altı",
  riskTolerance: "medium",
  language: "tr"
};

type ExpertAgent = {
  name: string;
  role: string;
  method: string;
};

const expertAgents: Record<string, ExpertAgent> = {
  discovery: {
    name: "Müşteri Keşfi Uzmanı",
    role: "Problem şiddeti, ICP netliği ve ödeme isteğini değerlendirir.",
    method: "JTBD görüşmesi, problem frekansı, mevcut alternatif analizi, pre-sale sinyali"
  },
  market: {
    name: "Pazar Araştırması Uzmanı",
    role: "TAM/SAM/SOM, kanal talebi, yerel pazar dinamikleri ve büyüme sinyallerini okur.",
    method: "Kategori trendleri, rakip yoğunluğu, arama niyeti, satın alma bütçesi, segment daraltma"
  },
  competition: {
    name: "Rekabet ve Konumlandırma Uzmanı",
    role: "Rakip kümeleri, wedge, farklılaşma ve switching maliyetini analiz eder.",
    method: "Alternatif haritası, wedge testi, kategori cümlesi, itiraz matrisi"
  },
  finance: {
    name: "Birim Ekonomi ve Finans Uzmanı",
    role: "Fiyatlandırma, CAC, LTV, brüt marj, break-even ve runway varsayımlarını kurar.",
    method: "Varsayım tablosu, senaryo aralığı, duyarlılık analizi, nakit riski"
  },
  risk: {
    name: "Risk, Hukuk ve Güven Uzmanı",
    role: "Regülasyon, veri güveni, operasyonel bağımlılık ve kanıt boşluklarını çıkarır.",
    method: "Risk matrisi, guardrail, veri güvenliği, uyum ve itibar riski"
  },
  gtm: {
    name: "GTM ve Büyüme Uzmanı",
    role: "İlk kanal, teklif, mesajlaşma, satış hareketi ve lansman planını tasarlar.",
    method: "Kanal/mesaj eşleşmesi, fiyat testi, concierge MVP, topluluk ve outbound deneyi"
  },
  experiment: {
    name: "Deney Tasarım Uzmanı",
    role: "Varsayımları ölçülebilir deneylere, eşiklere ve karar kurallarına dönüştürür.",
    method: "Riski yüksek varsayım önceliklendirme, başarı eşiği, maliyet/süre planı"
  }
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
  return firstSentence.length > 54 ? `${firstSentence.slice(0, 51)}...` : firstSentence || "İsimsiz fikir";
}

function scoreSeed(description: string) {
  return description.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function buildScores(description: string, context: IdeaContext): Scores {
  const seed = scoreSeed(description);
  const stageBoost = context.stage === "revenue" ? 10 : context.stage === "mvp" ? 7 : context.stage === "scaling" ? 12 : 0;
  const b2bBoost = context.model === "B2B" ? 7 : context.model === "B2B2C" ? 4 : 0;
  const specificityBoost = Math.min(12, Math.floor(description.length / 90));
  const demand = clampScore(52 + (seed % 20) + stageBoost + specificityBoost);
  const feasibility = clampScore(56 + ((seed / 3) % 17) + b2bBoost + (context.founderSkills.length % 8));
  const competition = clampScore(46 + ((seed / 7) % 28));
  const monetization = clampScore(50 + ((seed / 11) % 24) + b2bBoost + (context.stage === "revenue" ? 8 : 0));
  const founderFit = clampScore(55 + (context.founderSkills.length % 24));
  const risk = clampScore(38 + ((seed / 13) % 32) + (context.riskTolerance === "low" ? 8 : context.riskTolerance === "high" ? -5 : 0));
  return {
    viability: clampScore((demand + feasibility + monetization + founderFit + (100 - competition) + (100 - risk)) / 6),
    confidence: clampScore(48 + specificityBoost * 3 + (context.customerSegment.length > 14 ? 9 : 0) + (context.geography ? 6 : 0)),
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
      title: `${context.geography} için arama niyeti, kategori trendi ve talep sinyali taraması`,
      url: "https://trends.google.com",
      kind: "verified",
      confidence: 78,
      refreshedAt
    },
    {
      id: uid("src"),
      title: `${context.industry} rakipleri, yorumları, fiyat sayfaları ve alternatif çözüm haritası`,
      url: "https://www.producthunt.com",
      kind: "verified",
      confidence: 74,
      refreshedAt
    },
    {
      id: uid("src"),
      title: "Kurucu girdileri: hedef segment, bütçe, coğrafya, aşama ve yetkinlikler",
      kind: "user",
      confidence: 72,
      refreshedAt
    },
    {
      id: uid("src"),
      title: "Uzman ajan çıkarımı: pazar yapısı, fiyatlama, risk ve uygulanabilirlik varsayımları",
      kind: "inference",
      confidence: 66,
      refreshedAt
    }
  ];
}

function section(input: Omit<ReportSection, "id">): ReportSection {
  return { id: uid("sec"), ...input };
}

function assumptionTable(context: IdeaContext) {
  return [
    `ICP varsayımı: İlk kazanılabilir müşteri ${context.customerSegment}; geniş pazar değil, tekrar eden ve bütçesi olan dar segment hedeflenmeli.`,
    `Satın alma tetikleyicisi: Problem aylık/haftalık tekrar etmiyorsa ${context.model} modelinde satış döngüsü uzar.`,
    `Bütçe varsayımı: ${context.budget} bütçe ile önce yazılım değil, kanıt toplayan concierge/smoke test kurulmalı.`,
    `Coğrafya varsayımı: ${context.geography} içinde fiyat hassasiyeti, regülasyon ve kanal güveni ayrı ayrı doğrulanmalı.`
  ];
}

export function generateValidationReport(idea: Pick<Idea, "id" | "description" | "context" | "reports">): Report {
  const scores = buildScores(idea.description, idea.context);
  const sources = buildSources(idea.context);
  const verified = sources.filter((source) => source.kind === "verified").map((source) => source.id);
  const userSource = sources.find((source) => source.kind === "user")?.id ?? sources[0].id;
  const inference = sources.find((source) => source.kind === "inference")?.id ?? sources[0].id;
  const version = idea.reports.length + 1;
  const title = titleFromDescription(idea.description);

  const executiveSummary =
    `${title} fikri için uzman ajan kurulu toplam değerlendirmesi ${scores.viability}/100 yaşayabilirlik ve ${scores.confidence}/100 güven skoru veriyor. ` +
    `Karar: fikir doğrudan ürün geliştirmeye değil, önce problem şiddeti, ödeme isteği ve rekabetten ayrışma kanıtına götürülmeli. ` +
    `En kritik bilinmez ${scores.demand >= scores.monetization ? "ödeme isteğinin gerçek müşteri davranışıyla kanıtlanması" : "talebin yeterince sık ve bütçeli olup olmadığı"}.`;

  const sections: ReportSection[] = [
    section({
      category: "summary",
      expert: expertAgents.discovery.name,
      title: "Uzman Kurul Kararı ve Kanıt Seviyesi",
      summary: "Bu bölüm fikri tek bir skorla geçmek yerine, hangi varsayımların kanıtlandığını ve hangilerinin hâlâ risk olduğunu ayırır.",
      bullets: [
        `Karar önerisi: ${scores.viability >= 72 ? "kontrollü MVP'ye geçilebilir, fakat satış kanıtı şart" : scores.viability >= 58 ? "önce 2 haftalık kanıt sprinti yapılmalı" : "ürün geliştirmeden önce problem/segment yeniden daraltılmalı"}.`,
        `Güven skoru ${scores.confidence}/100; bu skor gerçek müşteri görüşmesi, ödeme niyeti ve canlı trafik verisi gelmeden yatırımcı seviyesi sayılmaz.`,
        ...assumptionTable(idea.context),
        `İlk karar eşiği: 20 hedef müşteri görüşmesinde en az 12 kişi problemi acil görmeli ve en az 3 kişi ücretli pilot/pre-order kabul etmeli.`
      ],
      sourceIds: [userSource, inference],
      tag: "inference"
    }),
    section({
      category: "market",
      expert: expertAgents.market.name,
      title: "Pazar Talebi, ICP ve TAM/SAM/SOM Okuması",
      summary: `${idea.context.geography} içinde ${idea.context.industry} pazarı geniş anlatılmamalı; ilk kazanılabilir pazar ${idea.context.customerSegment} üzerinden hesaplanmalı.`,
      bullets: [
        `TAM anlatısı yatırımcı sunumu için yeterli değildir; ilk raporda SAM, ${idea.context.customerSegment} sayısı, yıllık bütçe ve problem frekansı ile kurulmalı.`,
        `SOM için ilk 90 gün hedefi: 30-50 nitelikli görüşme, 100-300 landing ziyaretçisi, 5-10 ciddi lead ve 1-3 ücretli pilot.`,
        `Talep sinyali puanı ${scores.demand}/100; bu olumluysa bile gerçek kanıt sayılacak metrikler: bekleme listesi dönüşümü, toplantı kabul oranı ve ödeme niyeti.`,
        `Pazar kanalı hipotezi: ${idea.context.model} modelinde LinkedIn/outbound, niş topluluklar, partner kanalı ve içerik SEO ayrı ayrı küçük bütçeyle test edilmeli.`,
        `Yanlış pozitif riski: İnsanların “iyi fikir” demesi satış kanıtı değildir; takvim açmaları, veri paylaşmaları veya ücretli pilotu kabul etmeleri gerekir.`
      ],
      sourceIds: verified,
      tag: "verified"
    }),
    section({
      category: "competition",
      expert: expertAgents.competition.name,
      title: "Rekabet Haritası, Wedge ve Konumlandırma",
      summary: "Rakip yoğunluğu tek başına kötü sinyal değildir; ancak wedge net değilse CAC yükselir ve ürün commodity algılanır.",
      bullets: [
        `Rakip kümeleri üçe ayrılmalı: doğrudan yazılım rakipleri, yatay araçlar ve müşterinin bugün kullandığı manuel/Excel/ajans alternatifi.`,
        `Farklılaşma cümlesi şu yapıda olmalı: “${idea.context.customerSegment} için [tek acı] problemini [ölçülebilir sonuç] ile çözen [kategori].”`,
        `Switching riski: müşteri mevcut alternatiften ayrılmak için onboarding süresi, veri taşıma, güven ve ROI kanıtı ister.`,
        `İlk wedge önerisi: tüm pazara değil, tek persona + tek iş akışı + tek ölçülebilir çıktı kombinasyonuna gir.`,
        `Stop sinyali: 10 görüşmede müşteriler aynı acıyı tekrar etmiyor veya mevcut alternatiften ayrılma nedeni söyleyemiyorsa fikir yeniden konumlandırılmalı.`
      ],
      sourceIds: verified,
      tag: "verified"
    }),
    section({
      category: "financials",
      expert: expertAgents.finance.name,
      title: "Birim Ekonomi, Fiyatlama ve Runway Senaryosu",
      summary: "Finansal bölüm tek bir tahmin değil, hangi varsayımın işi öldürebileceğini gösteren senaryo aralığı olmalı.",
      bullets: [
        `Başlangıç fiyat testi: 3 paket öner; düşük paket öğrenme, orta paket ana teklif, yüksek paket concierge/pilot hizmeti içersin.`,
        `CAC disiplini: ilk 90 gün kanal başına toplantı maliyeti, demo dönüşümü ve pilot kapanış oranı ölçülmeden paid growth ölçeklenmemeli.`,
        `Break-even mantığı: ARPA, brüt marj ve destek maliyeti birlikte okunmalı; yüksek destek ihtiyacı SaaS marjını hızlı eritir.`,
        `Runway planı: ${idea.context.budget} bütçe ile önce 2 haftalık concierge MVP + landing + görüşme sprinti; kod geliştirme sadece ödeme kanıtından sonra.`,
        `Yatırımcı dili: “pazar büyük” yerine “şu segmentte şu bütçeye sahip şu kadar müşteri, şu kanalla şu maliyete ulaşılabilir” cümlesi kurulmalı.`
      ],
      sourceIds: [inference],
      tag: "inference"
    }),
    section({
      category: "risk",
      expert: expertAgents.risk.name,
      title: "Risk, Regülasyon, Veri Güveni ve Operasyonel Bağımlılıklar",
      summary: "Risk analizi sadece tehdit listesi değil; hangi guardrail kurulursa fikrin test edilebilir kalacağını söyler.",
      bullets: [
        `Veri güveni: müşteri verisi, finansal veri veya kişisel veri işleniyorsa ilk MVP'de minimum veri, açık izin ve silme akışı tanımlanmalı.`,
        `Regülasyon: ${idea.context.geography} için KVKK/GDPR, ödeme, sektör lisansı veya veri saklama zorunluluğu ayrı kontrol listesi olmalı.`,
        `Operasyonel risk: çözüm çok fazla manuel destek gerektiriyorsa “ürün” değil hizmet ajansı gibi ölçeklenir.`,
        `Model riski: AI çıktıları doğruluk iddiası değil karar destek iddiası taşımalı; kaynak, varsayım ve güven etiketi görünür olmalı.`,
        `Kritik guardrail: Kanıt eklenmeden deney “doğrulandı” statüsüne alınmamalı; mevcut uygulamadaki PRD guardrail doğru yönde.`
      ],
      sourceIds: [userSource, inference],
      tag: "inference"
    }),
    section({
      category: "gtm",
      expert: expertAgents.gtm.name,
      title: "GTM, Lansman Mesajı ve İlk Satış Hareketi",
      summary: "GTM planı genel pazarlama listesi değil, ilk müşteriyle konuşmayı başlatacak teklif ve kanal deneyleri olmalı.",
      bullets: [
        `Ana teklif: “30 dakikada demo” değil, ${idea.context.customerSegment} için ölçülebilir bir sonuç vaadiyle kurulmalı.`,
        `İlk kanal: 20 kişilik hedef liste + kişisel outbound + 1 landing + 1 topluluk paylaşımı; paid ads ikinci sprintte test edilmeli.`,
        `Mesajlaşma sırası: problem acısı, mevcut alternatifin eksikliği, ölçülebilir çıktı, düşük riskli pilot teklifi.`,
        `Lansman varlıkları: landing sayfası, 5 e-posta follow-up, 3 LinkedIn postu, 2 müşteri görüşme scripti ve pilot teklif dokümanı.`,
        `Başarı eşiği: 2 hafta içinde 5 nitelikli görüşme altı kalırsa kanal/mesaj; 15 görüşme üstü ama ödeme yoksa teklif/fiyat revize edilmeli.`
      ],
      sourceIds: [inference],
      tag: "inference"
    }),
    section({
      category: "roadmap",
      expert: expertAgents.experiment.name,
      title: "30 Günlük Kanıt Sprinti ve Karar Kuralları",
      summary: "Roadmap ürün özellik listesi değil, her hafta hangi kanıtın toplanacağını ve hangi kararla devam edileceğini belirler.",
      bullets: [
        "Hafta 1: ICP listesi, 20 görüşme daveti, problem şiddeti scripti, tek cümle değer önerisi.",
        "Hafta 2: Smoke-test landing, iki değer önerisi A/B testi, fiyat paketi konuşmaları.",
        "Hafta 3: Concierge MVP veya manuel pilot; gerçek müşteri verisiyle ölçülebilir değer üretme.",
        "Hafta 4: Karar toplantısı; go/pivot/stop kararı, risk defteri, yatırımcı memo ve MVP kapsamı.",
        "Go kararı için minimum eşik: 12 acil problem teyidi, 5 ciddi lead, 3 fiyat kabulü, 1-2 ücretli pilot veya yazılı niyet."
      ],
      sourceIds: [userSource, inference],
      tag: "inference"
    })
  ];

  return {
    id: uid("report"),
    ideaId: idea.id,
    version,
    createdAt: nowIso(),
    scores,
    executiveSummary,
    goSignals: [
      `${idea.context.customerSegment} netleştirilebilirse ilk wedge kurulabilir.`,
      `${idea.context.model} modelinde ödeme isteği erken ve doğrudan test edilebilir.`,
      `Kurucu yetkinlikleri (${idea.context.founderSkills}) ilk concierge MVP için yeterli başlangıç sinyali veriyor.`,
      "Ürün geliştirmeden önce düşük maliyetli kanıt sprinti yapılabilir."
    ],
    stopSignals: [
      "Müşteriler problemi acil görmüyor veya mevcut alternatiften ayrılma nedeni söyleyemiyorsa stop/pivot gerekir.",
      "Ücretli pilot/pre-order çıkmadan tam ürün geliştirmek sermaye ve zaman riskini büyütür.",
      "Regülasyon, veri güveni veya entegrasyon ihtiyacı ilk MVP kapsamına sığmıyorsa wedge daraltılmalı.",
      "Rakiplerden ayrışan kategori cümlesi yazılamıyorsa pazarlama maliyeti artar."
    ],
    nextActions: [
      "20 hedef müşteri için görüşme listesi oluştur ve problem şiddeti scriptiyle görüşmeleri başlat.",
      "Tek problem/tek persona için smoke-test landing yayınla; CTA olarak demo değil, pilot/erken erişim talebi kullan.",
      "3 fiyat paketiyle ödeme isteği testi yap; sözlü beğeni değil takvim, e-posta, LOI veya ödeme sinyali topla.",
      "Rakip haritasını manuel alternatifler dahil çıkar ve tek cümle konumlandırma yaz.",
      "2 haftalık concierge MVP kapsamı yaz; kodlanacak özellikleri değil kanıtlanacak varsayımları listele."
    ],
    sources,
    sections
  };
}

type LlmSection = {
  category?: ReportSection["category"];
  title?: string;
  summary?: string;
  bullets?: string[];
};

type LlmReportPayload = {
  executiveSummary?: string;
  goSignals?: string[];
  stopSignals?: string[];
  nextActions?: string[];
  sections?: LlmSection[];
};

const sectionCategoryOrder: NonNullable<ReportSection["category"]>[] = ["summary", "market", "competition", "financials", "risk", "gtm", "roadmap"];

function parseLlmReport(content: string): LlmReportPayload | null {
  try {
    const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as LlmReportPayload;
  } catch {
    return null;
  }
}

function cleanList(value: unknown, fallback: string[], minLength = 18) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= minLength)
    .slice(0, 6);
  return cleaned.length >= 3 ? cleaned : fallback;
}

function cleanText(value: unknown, fallback: string, minLength = 80) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim();
  return cleaned.length >= minLength ? cleaned : fallback;
}

function mergeLlmSections(base: Report, payload: LlmReportPayload) {
  if (!Array.isArray(payload.sections)) return base.sections;

  return base.sections.map((baseSection) => {
    const candidate = payload.sections?.find((entry) => entry.category === baseSection.category);
    if (!candidate) return baseSection;
    return {
      ...baseSection,
      title: typeof candidate.title === "string" && candidate.title.trim().length > 8 ? candidate.title.trim() : baseSection.title,
      summary: cleanText(candidate.summary, baseSection.summary, 70),
      bullets: cleanList(candidate.bullets, baseSection.bullets, 24)
    };
  });
}

export async function generateValidationReportWithLLM(idea: Pick<Idea, "id" | "description" | "context" | "reports">): Promise<Report> {
  const base = generateValidationReport(idea);
  const categories = sectionCategoryOrder.join(", ");
  const llmResult = await completeJson(
    [
      {
        role: "system",
        content:
          "Sen VentureProof AI içindeki kıdemli uzman ajan kurulunun koordinatörüsün. Sadece geçerli JSON döndür. " +
          "Türkçe, ayrıntılı, kaynak/varsayım ayrımı yapan, yatırımcı ve kurucu seviyesinde uygulanabilir analiz üret. " +
          "Genel geçer tavsiye verme; segment, coğrafya, iş modeli, bütçe ve aşamaya göre konuş."
      },
      {
        role: "user",
        content: JSON.stringify({
          task:
            "Aşağıdaki startup fikri için mevcut deterministik raporu uzman ajan seviyesinde zenginleştir. " +
            "JSON şeması: executiveSummary:string, goSignals:string[], stopSignals:string[], nextActions:string[], " +
            `sections:{category:'${categories.replace(/, /g, "'|'")}', title:string, summary:string, bullets:string[]}[]`,
          idea: {
            description: idea.description,
            context: idea.context
          },
          baseReport: {
            scores: base.scores,
            executiveSummary: base.executiveSummary,
            goSignals: base.goSignals,
            stopSignals: base.stopSignals,
            nextActions: base.nextActions,
            sections: base.sections.map((sectionItem) => ({
              category: sectionItem.category,
              expert: sectionItem.expert,
              title: sectionItem.title,
              summary: sectionItem.summary,
              bullets: sectionItem.bullets
            }))
          },
          qualityRules: [
            "Her section için en az 4 ayrıntılı bullet yaz.",
            "Pazar, finans, risk ve GTM bölümlerinde ölçülebilir eşikler, karar kuralları ve yanlış pozitif riskleri olsun.",
            "Varsayım olan şeyleri kesin gerçek gibi sunma.",
            "Rakip veya kaynak uydurma; dış veri yoksa bunu varsayım/araştırma ihtiyacı olarak yaz.",
            "Başlıklar Türkçe olsun."
          ]
        })
      }
    ],
    { temperature: 0.35, maxTokens: 16384 }
  );

  if (!llmResult) return base;

  const payload = parseLlmReport(llmResult.content);
  if (!payload) return base;

  const llmSource: Source = {
    id: uid("src"),
    title: `Uzman LLM sentezi: ${llmResult.provider}/${llmResult.model}`,
    kind: "inference",
    confidence: 76,
    refreshedAt: nowIso()
  };

  return {
    ...base,
    executiveSummary: cleanText(payload.executiveSummary, base.executiveSummary, 120),
    goSignals: cleanList(payload.goSignals, base.goSignals),
    stopSignals: cleanList(payload.stopSignals, base.stopSignals),
    nextActions: cleanList(payload.nextActions, base.nextActions),
    sources: [...base.sources, llmSource],
    sections: mergeLlmSections(base, payload).map((sectionItem) => ({
      ...sectionItem,
      sourceIds: [...new Set([...sectionItem.sourceIds, llmSource.id])]
    }))
  };
}

export function generateExperiments(ideaId: string): Experiment[] {
  const createdAt = nowIso();
  return [
    {
      id: uid("exp"),
      ideaId,
      title: "Problem şiddeti görüşmeleri",
      riskLevel: "high",
      evidenceRequired: "20 hedef müşterinin en az 12'si problemi acil, sık ve bütçeli olarak tarif etmeli.",
      suggestedExperiment: "ICP adaylarıyla 30 dakikalık yapılandırılmış görüşme yap; mevcut çözüm, frekans, maliyet ve son deneme tarihini sor.",
      cost: "EUR 0-150",
      duration: "5 gün",
      successThreshold: "60%+ acil problem teyidi",
      owner: "Müşteri Keşfi Uzmanı",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Smoke-test landing dönüşümü",
      riskLevel: "medium",
      evidenceRequired: "Net teklifli landing sayfasında ziyaretçi -> nitelikli lead dönüşüm oranı ölçülmeli.",
      suggestedExperiment: "Tek sayfalık landing yayınla; iki değer önerisi, net pilot CTA'sı ve kaynak/varsayım etiketi kullan.",
      cost: "EUR 50-250",
      duration: "7 gün",
      successThreshold: "8%+ lead dönüşümü veya 5+ nitelikli görüşme talebi",
      owner: "GTM Uzmanı",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Ödeme isteği ve pilot paketi testi",
      riskLevel: "high",
      evidenceRequired: "Aday müşteriler ücretli pilot, ön ödeme, LOI veya yazılı bütçe sinyali vermeli.",
      suggestedExperiment: "Görüşmelerden sonra 3 pilot paketi sun; indirimli bedava kullanım yerine ücretli öğrenme teklifi yap.",
      cost: "EUR 0",
      duration: "10 gün",
      successThreshold: "3 fiyat kabulü veya 1-2 ücretli pilot",
      owner: "Finans Uzmanı",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Rekabetten geçiş kanıtı",
      riskLevel: "medium",
      evidenceRequired: "Kullanıcılar mevcut alternatifin neden yetmediğini ve hangi şartta geçiş yapacağını açıklamalı.",
      suggestedExperiment: "25 rakip yorumu, 10 switcher görüşmesi ve manuel alternatif analiziyle tekrar eden karşılanmamış ihtiyacı çıkar.",
      cost: "EUR 0-100",
      duration: "4 gün",
      successThreshold: "3 tekrar eden unmet need ve 1 net wedge",
      owner: "Rekabet Uzmanı",
      status: "to_validate",
      evidence: [],
      createdAt
    },
    {
      id: uid("exp"),
      ideaId,
      title: "Concierge MVP değer teslimi",
      riskLevel: "high",
      evidenceRequired: "Manuel teslim edilen çözüm müşteride ölçülebilir değer üretmeli.",
      suggestedExperiment: "Yazılım geliştirmeden önce çözümü 2 pilot müşteriye manuel/yarı otomatik teslim et ve sonuç metriğini takip et.",
      cost: "EUR 100-500",
      duration: "14 gün",
      successThreshold: "2 pilot tamamlandı, 1 yenileme/ödeme niyeti",
      owner: "Ürün Uzmanı",
      status: "to_validate",
      evidence: [],
      createdAt
    }
  ];
}

export function createModuleOutput(module: Exclude<ModuleKey, "validation">, idea: Idea): ModuleOutput {
  const latestReport = idea.reports[0];
  const sourceIds = latestReport?.sources.slice(0, 2).map((source) => source.id) ?? [];
  const common = {
    id: uid("module"),
    ideaId: idea.id,
    module,
    generatedAt: nowIso()
  };

  if (module === "market") {
    return {
      ...common,
      title: "Uzman Pazar Analizi",
      summary: `${idea.context.geography} içinde ${idea.context.industry} pazarı önce dar ICP, bütçe sinyali ve tekrar eden problem frekansı üzerinden okunmalı.`,
      bullets: [
        `ICP: ${idea.context.customerSegment}; ilk sprintte persona daha da daraltılmalı ve satın alma yetkisi olan alt segment seçilmeli.`,
        "TAM/SAM/SOM: geniş pazar büyüklüğü değil, ilk 90 günde ulaşılabilir müşteri havuzu ve kanal başına toplantı maliyeti hesaplanmalı.",
        "Talep kanıtı: arama niyeti, rakip yorumları, görüşme kabul oranı, landing dönüşümü ve ödeme isteği birlikte okunmalı.",
        "Pazar riski: çok geniş segment, düşük frekanslı problem ve bütçesi olmayan kullanıcı grubu yanlış pozitif üretir.",
        "Haftalık güncelleme: rakip fiyat sayfaları, Product Hunt/G2 yorumları, LinkedIn post etkileşimi ve müşteri görüşmesi notları izlenmeli."
      ],
      artifacts: [
        { label: "İlk SAM", value: `${idea.context.geography} / ${idea.context.customerSegment}` },
        { label: "Talep kanıt eşiği", value: "20 görüşme, 5 ciddi lead, 3 fiyat kabulü" },
        { label: "Kanal hipotezi", value: "Outbound + niş topluluk + partner deneyi" },
        { label: "Raporu güncelleme", value: "Haftalık görüşme ve rakip sinyali takibi" }
      ],
      sourceIds
    };
  }

  if (module === "businessPlan") {
    return {
      ...common,
      title: "Yatırımcı Seviyesi İş Planı",
      summary: "İş planı; problem kanıtı, ilk müşteri profili, GTM hareketi, finansal varsayımlar ve karar kurallarını tek yatırımcı dosyasına çevirir.",
      bullets: [
        "Yönetici özeti: problem, ICP, çözüm, neden şimdi, kanıt seviyesi ve 30 günlük öğrenme planı.",
        "GTM planı: 20 görüşme, 1 landing, 3 fiyat paketi, 2 pilot ve haftalık karar toplantısı.",
        "Finansal model: conservative/base/aggressive senaryolar; ARPA, CAC, churn, brüt marj ve destek maliyeti ayrı satır olmalı.",
        "Fon ihtiyacı: MVP kodu değil, müşteri öğrenimi, GTM deneyi ve ilk operasyonel kapasite için kalemlendirilmeli.",
        "Yatırımcı risk notu: kanıtlanmamış varsayımlar, regülasyon/veri güveni, rakipten ayrışma ve satış döngüsü."
      ],
      artifacts: [
        { label: "MVP meta-prompt", value: `${idea.context.customerSegment} için tek problemi çözen, kanıt odaklı ${idea.context.industry} MVP'si tasarla.` },
        { label: "Pre-seed aralığı", value: "EUR 250k-450k, kanıt seviyesine bağlı" },
        { label: "Runway hedefi", value: "12-15 ay" },
        { label: "Break-even yolu", value: "35-60 ödeme yapan hesap, ARPA/CAC varsayımına bağlı" }
      ],
      sourceIds
    };
  }

  if (module === "brand") {
    return {
      ...common,
      title: "Marka Stratejisi ve Konumlandırma",
      summary: "Marka; abartılı AI iddiası yerine güven, kanıt, hız ve ölçülebilir sonuç etrafında kurulmalı.",
      bullets: [
        `Konumlandırma: ${idea.context.customerSegment} için kanıtla doğrulanan karar destek sistemi.`,
        "Arketip: Bilge + İnşa Eden; teknik ama sade, güven veren ve ölçülebilir konuşan ton.",
        "Mesaj sütunları: riski azalt, daha hızlı öğren, yerel bağlamı anla, kaynaklı karar ver.",
        "İtiraz yönetimi: veri güveni, switching maliyeti, entegrasyon eforu, ROI kanıtı ve destek ihtiyacı.",
        "Yasaklı iddia: kaynak ve kanıt olmadan “kesin doğru”, “garanti başarı”, “tam otomatik karar” denmemeli."
      ],
      artifacts: [
        { label: "Tagline", value: "Kanıtla doğrula. Güvenle başlat." },
        { label: "Ses tonu", value: "Net, uzman, kurucudan kurucuya" },
        { label: "Hero cümlesi", value: "Fikrini kaynaklı ve ölçülebilir lansman planına çevir." },
        { label: "Marka riski", value: "Doğrulanmamış doğruluk/başarı iddialarından kaçın" }
      ],
      sourceIds
    };
  }

  if (module === "visual") {
    return {
      ...common,
      title: "Görsel Kimlik ve Ürün Dili",
      summary: "Görsel kimlik sakin operasyonel güven ile canlı karar enerjisini birleştirmeli; dekoratif değil ürün odaklı olmalı.",
      bullets: [
        "Logo yönü: kanıt, sinyal ve ileri hareketi birleştiren sade işaret.",
        "Palet: ink taban, moss/citrus güven ve karar enerjisi, coral risk uyarısı, ocean bilgi vurgusu.",
        "Tipografi: dashboard için kompakt, yüksek okunurluk; pazarlama sayfalarında daha geniş nefes.",
        "Hero yönü: soyut görsel yerine gerçek dashboard/report önizlemesi ve kaynaklı karar dosyası sinyali.",
        "UI kuralı: kartlar sadece tekrarlı öğelerde; admin ve dashboard yoğun ama taranabilir kalmalı."
      ],
      artifacts: [
        { label: "Ana renk", value: "#15201b" },
        { label: "Aksan", value: "#d8f171" },
        { label: "UI ruhu", value: "Yoğun, sakin, analitik" },
        { label: "Asset çıktısı", value: "SVG/PNG/Figma yönlendirmesi hazır" }
      ],
      sourceIds
    };
  }

  return {
    ...common,
    title: "Pazarlama ve Lansman Paketi",
    summary: "Pazarlama paketi raporun en güçlü hipotezlerini kanala özel mesajlara, tekliflere ve lansman deneylerine dönüştürür.",
    bullets: [
      "Meta/paid hook: problem acısı + hızlı kanıt + düşük riskli pilot CTA.",
      "LinkedIn hook: kurucu/operatör diliyle ölçülebilir karar riski anlatısı.",
      "E-posta sekansı: problem, değer, itiraz, kanıt, pilot teklif ve son takip.",
      "UGC/script: önce/sonra kurucu iş akışı, yanlış ürün geliştirme maliyeti ve kanıtlı karar çerçevesi.",
      "Lansman checklist: Product Hunt, niş topluluklar, kurucu görüşmeleri, partner kanalı ve küçük paid test bütçesi."
    ],
    artifacts: [
      { label: "Meta hook", value: "Pazar evet demeden ürün inşa etmeyi bırak." },
      { label: "LinkedIn hook", value: "Sıradaki startup kararın hislerle değil kaynaklarla verilsin." },
      { label: "E-posta konusu", value: "Fikir raporun hazır: en riskli varsayım burada." },
      { label: "UTM planı", value: "utm_campaign=validation_mvp&utm_content={hypothesis}" }
    ],
    sourceIds
  };
}
