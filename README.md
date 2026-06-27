# VentureProof AI

Evidence-first AI startup validation and launch planning platform inspired by the PRD in `outputs/ideaproof-benzeri-gelismis-prd.md`.

## What is built

- Public landing page, features page and pricing page
- Email/password auth with HTTP-only session cookie
- 100-credit signup bonus
- Founder dashboard with app-contained idea creation flow
- Credit ledger persisted in `.data/ventureproof.json`
- OpenAI-compatible AI provider with OpenAI, OpenRouter and GLM fallback
- Deterministic deep report fallback when no LLM key is configured
- Evidence labels: verified, inference and user-provided
- Validation report with scores, go/stop signals and next actions
- Automatic experiment board with evidence guardrail
- Mock billing that adds credits without external keys
- Markdown report export
- Paid journey module generation for market, business plan, brand, visual identity and marketing suite
- Public share links for validation reports and generated artifacts
- Credit ledger view in the dashboard

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Next.js API routes
- Local JSON persistence for the keyless MVP

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Seed a demo account:

```bash
npm run seed
```

Demo login: `demo@ventureproof.ai` / `DemoPass!2026`

## Checks

```bash
npm run typecheck
npm run build
```

## Deploy

See `DEPLOYMENT.md` for Docker and Coolify notes.

## Environment keys to add later

The app currently runs without secrets. Production integrations can be added behind the existing provider and API boundaries:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
OPENAI_BASE_URL=https://api.openai.com/v1
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=google/gemini-3.5-flash
GLM_API_KEY=
GLM_BASE_URL=https://api.z.ai/api/coding/paas/v4
GLM_MODEL=glm-5.2
AI_PROVIDER_ORDER=openrouter,openai,glm
NEXT_PUBLIC_APP_URL=https://ventureproof.seymata.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
SERP_API_KEY=
TAVILY_API_KEY=
POSTHOG_KEY=
SENTRY_DSN=
```

OpenRouter anahtarını ham haliyle yazın; başına `Bearer` eklemeyin. Şimdilik OpenRouter içindeki seçili model `OPENROUTER_MODEL=google/gemini-3.5-flash`. Farklı model kullanacaksanız OpenRouter panelindeki model slug'ını girin.

## Production notes

- Replace `.data/ventureproof.json` with Postgres tables matching the domain types in `src/types/domain.ts`.
- Replace mock auth with Auth.js, Clerk or Supabase Auth.
- Replace mock billing in `src/app/api/billing/purchase/route.ts` with Stripe Checkout and webhooks.
- Replace module generation in `src/app/api/ideas/[id]/modules/[module]/route.ts` with queued background jobs before real traffic.
- Extend `src/lib/ai-provider.ts` with queued research, citations and image generation jobs.
- Keep the credit ledger as the source of truth for all paid AI work.
