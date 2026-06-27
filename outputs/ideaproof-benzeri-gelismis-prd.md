# PRD: AI Startup Validation & Launch Platform

Hazirlama tarihi: 27 Haziran 2026  
Referans inceleme: https://ideaproof.io/, /auth, /dashboard, /validate-idea, /pricing, /features ve urun modulu sayfalari  
Calisma adi: VentureProof AI

## 1. Kisa Ozet

VentureProof AI, kurucularin bir is fikrini dakikalar icinde dogrulamasini, pazari ve rakipleri analiz etmesini, finansal projeksiyon cikarmasini, is plani/marka/kimlik/pazarlama materyallerini uretmesini saglayan AI destekli kurucu platformudur.

Referans urun IdeaProof, "120 saniyede startup fikri validasyonu" vaadiyle giriyor; dashboard icinde kredi temelli bir "journey" sunuyor: Idea Validation, Market Analysis, Business Plan, Brand Strategy, Visual Identity, Ad Campaign. Gelistirilmis urunde ayni temel akisi koruyup daha guvenilir veri kaynaklari, kanitlanabilir rapor referanslari, deney yonetimi, ekip calismasi, yerellestirme ve uygulanabilir go-to-market otomasyonlari eklenecek.

## 2. Inceleme Bulgulari

### 2.1 Landing Page

IdeaProof landing ana mesaji:

- "Startup idea validator 2026", "AI market analysis in 120s"
- 50+ kriter ile validasyon, TAM/SAM/SOM, rakip SWOT, finansal projeksiyon, investor-ready business plan
- Marka stratejisi, AI logo, visual identity, platform bazli reklam kreatifleri
- 90 ucretsiz kredi, kredi bazli tek seferlik satin alma, abonelik yok
- Guven sinyalleri: 10,000+ kurucu, 89% prediction accuracy, 4.8/5 memnuniyet, 156+ launch gibi iddialar
- SEO stratejisi cok genis: calculators, templates, industry validators, idea lists, failure database, guides, comparison pages

### 2.2 Auth ve Dashboard

Gozlemlenen auth:

- Email/sifre ile giris
- Sign up / sign in toggle
- Google ile devam et
- Kayit sonrasi 90 kredi veriliyor
- Dashboard korumali; deep link auth'a yonleniyor

Dashboard ana iskeleti:

- Sol sidebar: Validate new idea, quick tools, account, buy credits
- Quick tools: Generate new idea, Calculators, Failure Database, Industry Benchmarks
- Header: secili fikir, kredi bakiyesi, export butonu
- Bos durum: "Start Your Validation Journey"
- Journey stepper:
  - Idea Validation: 40 credits, ready
  - Market Analysis: 100 credits, locked
  - Business Plan: 100 credits, locked
  - Brand Strategy: 50 credits, locked
  - Visual Identity: 150 credits, locked
  - Ad Campaign: 250 credits, locked

Not: Testte dashboard icindeki validasyon CTA'si iki kez landing sayfasina geri yonlendi. Bu davranis urun akisi icin kritik bir UX/route bug'i olarak ele alinmali.

### 2.3 Public Rapor Deneyimi

Public demo rapor su bolumleri gosteriyor:

- Validation Summary
- Go Signals / Stop Signals
- What to do next
- Criteria Radar
- Market Factors / Execution Factors
- Validation Scorecard
- Detailed score explanations
- Market Sizing & Stage
- Live Demand Signals
- Reddit Signal, Search Trends Signal, Live Market Signals
- Competitive Landscape
- Target Customer & Discovery
- Key Interview Questions
- Validation Experiments
- Revenue Model, Revenue Projections, Unit Economics
- Execution Roadmap, Implementation Roadmap, Quick Wins
- Tech & Team
- Strategic Opportunities
- Risk Map / Risk Matrix
- Founders who failed in your space
- Next Moves / experiment board: To Validate, In Progress, Confirmed, False

### 2.4 Pricing

Observed pricing model:

- 90 free credits on signup
- One-time payments, no subscription
- Credits never expire
- VAT included
- Starter: EUR 19.99, 150 credits, approx 3 validations
- Builder: EUR 49.99 list, EUR 42.49 promo, 700 credits
- Founder: EUR 99.99 list, EUR 84.99 promo, 1500 credits
- Every plan includes PDF exports, email support, lifetime credits

## 3. Urun Vizyonu

Kurucularin "Bu fikri yapmali miyim?" sorusundan "Ilk validasyon deneyini nasil kosarim ve yatirimciya nasil anlatirim?" sorusuna kadar tek bir calisma alaninda ilerlemesini saglamak.

Urun, sadece AI raporu ureten bir chatbot degil; veri kaynaklarini, varsayimlari, deneyleri, finansal modeli, marka/launch varliklarini ve ekip kararlarini birbirine baglayan bir startup karar sistemi olmalidir.

## 4. Hedef Kullanici Segmentleri

1. Solo founder / indie hacker
   - Hizi ve maliyeti onemser.
   - Fikri secmek, MVP scope belirlemek, launch mesajlarini almak ister.

2. Early-stage startup ekibi
   - Rakip, pazar, pricing, GTM ve pitch deck malzemesine ihtiyac duyar.
   - Ekip ici yorum, versiyon ve export ister.

3. Ajans / startup studio
   - Birden fazla fikir/musteri yonetir.
   - White-label rapor, workspace, credit pooling ister.

4. Accelerator / VC analyst
   - Basvuru fikirlerini karsilastirmak ister.
   - Deal memo, risk scoring, founder-market fit degerlendirmesi ister.

## 5. Temel Deger Onerisi

"Fikrini 5 dakikada veriye dayali karar dosyasina cevir. Pazar, rakip, finans, risk, deney, marka ve launch planini tek akista olustur."

Ana farklastirma:

- Kaynakli ve kanitlanabilir raporlar
- Canli sinyal takibi ve rapor guncelleme
- Deney backlog'u ve evidence ledger
- Multi-model AI orchestration
- Yerel pazar destegi: Turkiye, MENA, EU, US secilebilir
- Investor/accelerator formatinda export

## 6. Basari Metrikleri

### North Star Metric

Validated Decision Rate: Rapor olusturan kullanicilarin 7 gun icinde en az bir karar vermesi veya bir deney baslatmasi.

### Aktivasyon

- Signup -> ilk fikir girisi: >= 55%
- Ilk validasyon raporu tamamlanma: >= 75%
- Ilk rapordan sonra en az 1 "next action" tiklama: >= 35%

### Monetizasyon

- Free -> paid conversion: >= 8%
- Paid kullanici basina 30 gunluk ortalama kredi tuketimi: >= 250
- Refund or complaint rate: <= 3%

### Kalite

- Rapor faydali puani: >= 4.3/5
- Kaynak guven puani: >= 4.2/5
- Hallucinated/unsupported claim report rate: <= 2%

## 7. MVP Kapsami

### 7.1 Public Website

Sayfalar:

- Home
- Pricing
- Features
- Validate Idea
- Market Research
- Business Plan
- Brand Strategy
- Visual Identity
- Marketing Suite
- Free tools directory
- Calculators
- Blog/guides
- Auth

Landing gereksinimleri:

- Hero: tek textarea ile fikir girisi
- Ucretsiz kredi vaadi
- Demo rapor preview
- Modul journey anlatimi
- Fiyat kartlari
- SSS
- Footer SEO directory

### 7.2 Auth

Gereksinimler:

- Email/sifre sign up
- Email/sifre sign in
- Google OAuth
- Forgot password
- Email verification opsiyonel: MVP'de soft verification, fraud artarsa zorunlu
- Terms/privacy consent text
- Signup sonrasi 90 ucretsiz kredi

Acceptance criteria:

- Kullanici kaydoldugunda dashboard'a doner.
- Deep link ile gelmis kullanici auth sonrasi hedef URL'ye yonlenir.
- Kredi bakiyesi ilk oturumda gorunur.
- Auth hatalari kullanici dostu mesajlarla verilir.

### 7.3 Dashboard

Ana ekran:

- Sidebar:
  - Validate new idea
  - My ideas
  - Idea generator
  - Calculators
  - Failure database
  - Benchmarks
  - Buy credits
  - Account/settings
- Header:
  - Secili fikir
  - Kredi bakiyesi
  - Export
  - Share
- Main:
  - Fikir listesi veya bos durum
  - Journey stepper
  - Rapor tabs
  - Next actions board

Acceptance criteria:

- Bos durumda validasyon CTA'si app icinde modal/form acar, landing'e yonlendirmez.
- Her fikir icin modul durumlari: locked, ready, generating, complete, failed.
- Kullanici birden fazla fikri kaydedip arayabilir.
- Kredi maliyeti islem oncesi net gosterilir.

### 7.4 Idea Validation Module

Input:

- Idea description
- Optional context:
  - Target geography
  - Industry
  - Customer segment
  - B2B/B2C/B2B2C
  - Stage: idea, MVP, revenue, scaling
  - Founder skills
  - Budget
  - Risk tolerance
  - Language

Output:

- Viability score: 0-100
- Confidence score
- Executive summary
- Go / stop / caution signals
- Top assumptions
- Demand evidence
- Competitive intensity
- Feasibility
- Monetization potential
- Defensibility
- Regulatory risk
- Recommended next actions
- Validation experiments

Acceptance criteria:

- 2-5 dakika icinde rapor uretilir.
- Her ana iddia icin en az bir kaynak veya "AI inference" etiketi vardir.
- Kullanicinin secili pazari raporda gorunur.
- Rapor yeniden generate edilebilir; onceki versiyonlar saklanir.

### 7.5 Market Analysis Module

Output:

- TAM/SAM/SOM
- Market growth trajectory
- Market stage: emerging/growing/mature/declining
- Demand signals:
  - Search trends
  - Reddit/community mentions
  - Product Hunt/G2/Capterra/marketplace reviews
  - News/funding activity
- Customer personas
- Jobs-to-be-done
- Pricing benchmarks
- Competitive landscape map
- SWOT
- Positioning gaps

Advanced requirement:

- "Source confidence" ve "last refreshed date" her veri blogunda gorunmeli.
- Kullanici pazar ulkesini degistirince pazar boyutlari yeniden hesaplanabilmeli.

### 7.6 Business Plan Module

Output:

- Executive summary
- Problem, solution, ICP
- Business model
- Pricing strategy
- GTM strategy
- Sales motion
- 12/24/36 aylik roadmap
- Hiring plan
- Unit economics
- Revenue projection
- Cost model
- Funding ask
- Risk mitigation
- Investor memo
- MVP build prompt

Acceptance criteria:

- PDF, DOCX ve Markdown export.
- Investor, accelerator, internal strategy formatlari.
- Finans tablolari editable olmalidir.

### 7.7 Brand Strategy Module

Output:

- Brand positioning
- Brand archetype
- Mission, vision, values
- Value proposition
- Tagline options
- Tone of voice
- Messaging pillars
- Objection handling
- Website hero copy
- Competitive positioning statement

Advanced:

- Rakip marka tonuyla karsilastirma.
- Marka tutarlilik skoru.

### 7.8 Visual Identity Module

Output:

- Logo concepts
- Color palette with hex codes
- Typography suggestions
- UI style direction
- Social avatar/banner
- Landing hero mockup
- Brand kit export

Advanced:

- SVG/PNG/PDF export
- Figma export
- Logo prompt history
- Trademark risk warning: "not legal advice"

### 7.9 Marketing Suite Module

Output:

- Platform-specific ads:
  - Meta
  - Google
  - LinkedIn
  - TikTok
  - Instagram
  - YouTube
- Landing page copy
- Email sequences:
  - welcome
  - value
  - objection
  - hard offer
  - reactivation
- UGC video scripts
- Launch checklist
- Product Hunt launch copy
- Cold outreach templates

Advanced:

- Campaign hypothesis ve target persona baglantisi.
- A/B test variants.
- UTM plan.
- CAC/LTV varsayimlarina bagli budget simulator.

### 7.10 Experiment Board

Referans urunde "To Validate / In Progress / Confirmed / False" board'u goruldu. Gelismis urunde bu ana farklastirici yapilmalidir.

Gereksinimler:

- AI rapordan otomatik varsayim listesi
- Her varsayim icin:
  - Risk level
  - Evidence required
  - Suggested experiment
  - Cost
  - Duration
  - Success threshold
  - Owner
  - Status
- Kanit yukleme:
  - link
  - not
  - dosya
  - interview transcript
  - survey result
- Evidence score
- Decision log

Acceptance criteria:

- Rapor bittikten sonra en az 5 varsayim otomatik board'a eklenir.
- Kullanici bir varsayimi confirmed/false yaptiginda rapor karar skoru guncellenir.
- Evidence olmadan confirmed'a almak isterse uyari gosterilir.

## 8. Gelismis Farklastiricilar

### 8.1 Evidence-First AI

Her rapor blogunda uc etiket:

- Verified source
- Model inference
- User-provided assumption

Bu, klasik AI raporlarin en buyuk sorunu olan "guzel ama kanitsiz" hissini azaltir.

### 8.2 Live Monitoring

Kullanici raporu olusturduktan sonra sistem haftalik izler:

- Yeni rakip
- Funding haberi
- Search trend artisi/dususu
- Community pain point degisimi
- Pricing degisikligi

Bildirimler:

- Email
- Dashboard notification
- Slack/webhook, B2B planda

### 8.3 Scenario Simulator

Kullanici varsayimlari degistirir:

- CAC
- conversion rate
- ARPU
- churn
- gross margin
- team cost
- launch country

Sistem:

- runway
- break-even
- funding need
- target customers required
- risk score

### 8.4 Founder Fit Score

Idea-market fit'e ek olarak founder-idea fit:

- founder skills
- domain access
- sales capability
- budget
- network
- geography

Output:

- "Bu fikir iyi ama senin acindan riskli"
- "Bu fikir orta ama founder advantage yuksek"

### 8.5 Workspace ve Collaboration

Takim ozellikleri:

- Workspace
- Role-based access
- Comments
- Mentions
- Version history
- Shareable read-only report
- White-label agency reports

### 8.6 Local Market Mode

Ozellikle Turkiye ve MENA icin:

- TRY/EUR/USD finansal model
- Yerel rekabet
- Yerel regülasyon uyarilari
- Yerel kanallar: Trendyol, Hepsiburada, Sahibinden, LinkedIn TR, Ekşi/Reddit/YouTube sinyalleri
- Turkce rapor dili

## 9. Veri Kaynaklari

MVP icin:

- Search trends provider
- Reddit API veya uygun sosyal listening servisi
- Product Hunt
- G2/Capterra benzeri review kaynaklari
- Crunchbase/PitchBook alternatifi veya public funding/news APIs
- Google/Bing search API
- Company websites
- SERP snippets
- User-provided documents

Gelistirilmis:

- LinkedIn ads library, Meta ads library
- App Store / Google Play reviews
- GitHub trends
- Patent/trademark APIs
- Local business registries
- E-commerce marketplace signals

Veri ilkeleri:

- Her kaynak timestamp ile saklanir.
- Kaynak kullanimi lisans ve robots politikalariyla uyumlu olur.
- AI ciktisinda kaynak linki veya kaynak kategorisi gosterilir.
- Hassas/veri koruma gerektiren kaynaklar icin PII redaction uygulanir.

## 10. AI Mimari Gereksinimleri

Pipeline:

1. Input normalization
2. Idea classification
3. Research plan generation
4. Source retrieval
5. Evidence extraction
6. Multi-model reasoning
7. Scoring
8. Report generation
9. Quality checks
10. Export and monitoring setup

Model strategy:

- Fast model: input parsing, classification
- Research model: source summaries
- Reasoning model: final scoring and synthesis
- Creative model: brand/marketing/visual prompts
- Image model: logo/mockup concepts

Guardrails:

- Unsupported numeric claim detector
- Citation requirement for market sizing
- Financial sanity checks
- Regulated industry disclaimers
- No legal/financial advice positioning
- Plagiarism and brand collision checks

## 11. Kredi ve Monetizasyon

MVP kredi yapisi:

- Signup: 100 free credits
- Idea Validation: 40 credits
- Market Analysis: 100 credits
- Business Plan: 120 credits
- Brand Strategy: 60 credits
- Visual Identity: 160 credits
- Marketing Suite: 250 credits
- Live Monitoring: 20 credits/month per idea veya paid plan dahil

Paketler:

- Starter: 200 credits
- Builder: 800 credits
- Founder: 1800 credits
- Studio: team seats + 5000 credits + white-label

Iyilestirmeler:

- Islem oncesi kredi tahmini
- Rapor blogu bazinda "bu nerede kredi harcadi" maliyet dokumu
- Failed generation kredi refund policy
- Regeneration discount
- Paket karsilastirma: "Bu paketle ne uretebilirim?"

## 12. Ekranlar

### 12.1 Home

Zorunlu bilesenler:

- Hero idea input
- "Try free" CTA
- Sample report preview
- Journey modules
- Trust metrics
- Pricing teaser
- SEO/free tools sections

### 12.2 Validate Idea Form

Bilesenler:

- Main idea textarea
- Optional context accordion
- Industry selector
- Geography selector
- Stage selector
- Language selector
- Credit cost preview
- Generate button

### 12.3 Report View

Bilesenler:

- Sticky score header
- Tabs: Summary, Scores, Market, Financials, Roadmap, Experiments
- Source confidence chips
- Export/share buttons
- Unlock next module CTA
- Comments, if workspace enabled

### 12.4 Dashboard

Bilesenler:

- Ideas table/cards
- Search/filter
- Journey status
- Credit balance
- Recent alerts
- Experiment board summary

### 12.5 Billing

Bilesenler:

- Credit balance
- Usage history
- Purchase credits
- Invoice history
- Refund/support link

## 13. Non-Functional Requirements

Performance:

- Landing LCP < 2.5s
- Dashboard first load < 3s
- Validation report generation P95 < 5 min
- Progress streaming during generation

Reliability:

- Generation job queue
- Retry on provider failure
- Partial report save
- Idempotent credit charging
- Refund credits on failed jobs

Security:

- OAuth + email auth
- Encrypted API keys
- Row-level tenant isolation
- Audit logs for billing and exports
- Rate limiting

Compliance:

- GDPR-ready data export/delete
- Cookie consent
- Terms/privacy
- AI disclaimer
- Billing invoice/VAT support

Accessibility:

- Keyboard navigable
- ARIA labels
- WCAG AA contrast
- Export text selectable

## 14. Analytics Events

Core events:

- signup_started
- signup_completed
- idea_submitted
- validation_started
- validation_completed
- report_tab_viewed
- source_clicked
- experiment_created
- experiment_status_changed
- module_unlocked
- export_clicked
- share_link_created
- credit_purchase_started
- credit_purchase_completed

Funnels:

- Landing -> idea input -> signup -> report
- Report -> unlock market analysis
- Free credits -> paid credits
- Report -> experiment board activation

## 15. Roadmap

### Phase 0: Prototype, 2 hafta

- Landing
- Auth
- Dashboard shell
- Idea validation form
- Static sample report
- Credit balance mock

### Phase 1: MVP, 6-8 hafta

- Real signup/login
- Credit ledger
- AI validation generation
- Report view
- PDF/Markdown export
- Pricing + payment
- Basic market sources
- Experiment board v1

### Phase 2: Full Founder Journey, 8-10 hafta

- Market Analysis
- Business Plan
- Brand Strategy
- Marketing Suite text outputs
- Share links
- Version history
- Usage analytics

### Phase 3: Differentiation, 10-12 hafta

- Live monitoring
- Evidence ledger
- Visual identity generation
- Scenario simulator
- Workspace collaboration
- Local market mode

### Phase 4: B2B/Studio, 12+ hafta

- White-label reports
- Team seats
- API
- Webhooks
- Accelerator/VC scoring dashboard
- Bulk idea analysis

## 16. Ana Riskler

1. AI raporlar guzel ama guvenilmez algilanabilir.
   - Cozum: kaynak, confidence, evidence ledger, inference label.

2. Market sizing hallucination riski.
   - Cozum: kaynak zorunlulugu, range kullanimi, methodology disclosure.

3. Kredi modeli karmasik gelebilir.
   - Cozum: "Bu paketle sunlari yaparsin" anlatimi, cost preview, usage history.

4. Generation sureleri uzun olabilir.
   - Cozum: job progress, partial sections, email when ready.

5. SEO/free tools urunu sisirebilir.
   - Cozum: public tools ile dashboard app'i ayrik route/app shell olarak kurgulamak.

6. Competitor kopyasi gibi gorunme riski.
   - Cozum: evidence-first, experiment board, local market mode, workspace, monitoring farklastirmalari.

## 17. Engineering Notlari

Onerilen stack:

- Frontend: Next.js App Router, TypeScript, Tailwind, shadcn/ui
- Backend: Next.js API routes veya NestJS/Fastify
- DB: Postgres
- Queue: BullMQ/Redis veya managed queue
- Auth: Clerk/Auth.js/Supabase Auth
- Billing: Stripe
- Storage: S3-compatible object storage
- AI: provider abstraction layer
- Search/retrieval: Tavily/SerpAPI/Exa benzeri provider + custom crawlers
- Observability: Sentry, OpenTelemetry, PostHog

Temel tablolar:

- users
- workspaces
- workspace_members
- ideas
- reports
- report_sections
- sources
- evidence_items
- experiments
- credit_ledger
- purchases
- generation_jobs
- exports
- share_links
- notifications

## 18. MVP Acceptance Summary

MVP tamam sayilmasi icin:

- Kullanici kaydolur ve 100 kredi alir.
- Fikir girip 40 krediyle validasyon raporu uretir.
- Rapor skoru, summary, go/stop signals, market/risk/financial/roadmap bolumlerini gosterir.
- Her ana iddia kaynak veya inference etiketi tasir.
- En az 5 deney otomatik board'a eklenir.
- Kullanici raporu PDF/Markdown export eder.
- Kullanici kredi satin alabilir.
- Dashboard'da tum fikirlerini ve modul durumlarini gorur.
- Generation basarisizsa kredi iade edilir.

## 19. Referanstan Daha Iyi Olmasi Icin Kritik Kararlar

- Raporlari sadece "AI yazisi" degil, kaynakli karar dosyasi yap.
- "Next moves" bolumunu gercek experiment workflow'una cevir.
- Kredi harcamasini seffaflastir.
- Yerel pazar secimi ve Turkce/MENA destegi ekle.
- Dashboard/landing route ayrimini temiz tut.
- Export ve share ozelliklerini erken cikart.
- Canli market monitoring'i premium farklastirici yap.

