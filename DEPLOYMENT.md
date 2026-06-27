# Deployment Guide

This app is ready for keyless Docker deployment. Real AI, Stripe and database keys can be added later.

## Local Docker

```bash
docker compose up --build
```

Open http://localhost:3000.

The compose file stores JSON persistence in the `ventureproof-data` volume mounted at `/data`.

## Seed Demo Data

For local development:

```bash
npm run seed
```

Demo account:

- Email: `demo@ventureproof.ai`
- Password: `DemoPass!2026`
- Shared report: `/share/demo`

For Docker/Coolify, run the same script in the container after deployment if you want demo data.

## Coolify

Recommended setup:

- Source: GitHub repository
- Build Pack: Dockerfile
- Port: `3000`
- Healthcheck path: `/api/health`
- Persistent storage:
  - Mount path: `/data`
  - Environment: `DATA_DIR=/data`

Required environment for the keyless MVP:

```bash
NODE_ENV=production
DATA_DIR=/data
NEXT_TELEMETRY_DISABLED=1
```

Optional future secrets:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
OPENAI_BASE_URL=https://api.openai.com/v1
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=
GLM_API_KEY=
GLM_BASE_URL=https://api.z.ai/api/coding/paas/v4
GLM_MODEL=glm-5.2
AI_PROVIDER_ORDER=openai,openrouter,glm
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

OpenRouter için `OPENROUTER_API_KEY` değerine sadece anahtarı yazın; başına `Bearer` eklemeyin. Uygulama sırayı `AI_PROVIDER_ORDER` ile takip eder; ilk çalışan sağlayıcı raporu üretir, tamamı başarısızsa deterministik uzman raporu devreye girer.

## Healthcheck

```bash
curl https://your-domain.com/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "ventureproof-ai",
  "users": 0,
  "ideas": 0,
  "time": "..."
}
```

## Production Upgrade Path

1. Move JSON persistence to Postgres.
2. Replace demo auth with Auth.js, Clerk or Supabase Auth.
3. Replace mock billing with Stripe Checkout and webhook-confirmed credit ledger entries.
4. Replace mock AI provider with queued jobs and real provider keys.
5. Add object storage for exports and generated visuals.
