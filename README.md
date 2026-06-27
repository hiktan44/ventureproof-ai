# VentureProof AI

Evidence-first AI startup validation and launch planning platform inspired by the PRD in `outputs/ideaproof-benzeri-gelismis-prd.md`.

## What is built

- Public landing page, features page and pricing page
- Email/password auth with HTTP-only session cookie
- 100-credit signup bonus
- Founder dashboard with app-contained idea creation flow
- Credit ledger persisted in `.data/ventureproof.json`
- Deterministic mock AI provider for validation reports
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

## Checks

```bash
npm run typecheck
npm run build
```

## Environment keys to add later

The app currently runs without secrets. Production integrations can be added behind the existing provider and API boundaries:

```bash
OPENAI_API_KEY=
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

## Production notes

- Replace `.data/ventureproof.json` with Postgres tables matching the domain types in `src/types/domain.ts`.
- Replace mock auth with Auth.js, Clerk or Supabase Auth.
- Replace mock billing in `src/app/api/billing/purchase/route.ts` with Stripe Checkout and webhooks.
- Replace module generation in `src/app/api/ideas/[id]/modules/[module]/route.ts` with queued background jobs before real traffic.
- Replace `src/lib/ai-provider.ts` with a provider abstraction that supports research, reasoning, citations and image generation.
- Keep the credit ledger as the source of truth for all paid AI work.
