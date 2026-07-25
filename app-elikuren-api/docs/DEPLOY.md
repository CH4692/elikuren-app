# Neon + Render Setup

This document is the operational checklist to connect `elikuren-api` to Neon and Render.
Secrets stay in dashboards — never commit them.

## 1. Neon (Frankfurt / EU)

1. Create project `elikuren` in region **Frankfurt (eu-central-1)** if available, otherwise nearest EU region.
2. Create branches:
   - `main` → production
   - `staging` → staging/preview API
   - optional `dev` for shared cloud development
3. For each branch, copy:
   - **Pooled** connection string → `DATABASE_URL`
   - **Direct** connection string → `DATABASE_URL_MIGRATIONS`
4. Convert scheme to SQLAlchemy/psycopg form:
   - `postgresql://...` → `postgresql+psycopg://...`
5. Keep Neon SSL defaults (`sslmode=require`).

### Fresh schema (recommended for current MVP)

No production user data assumed. After the first Render deploy / local migrate:

```bash
uv run alembic upgrade head
```

### If migrating existing Hetzner data later

```bash
pg_dump -Fc "$OLD_DATABASE_URL" -f elikuren.dump
pg_restore --clean --if-exists -d "$NEON_DIRECT_URL" elikuren.dump
uv run alembic stamp head   # only if schema already matches
```

## 2. Render

1. Create a Render account and connect the `elikuren-api` GitHub repository.
2. Apply [`render.yaml`](../render.yaml) (Blueprint) **or** create two Docker Web Services manually:
   - `elikuren-api` (production, branch `main`)
   - `elikuren-api-staging` (staging branch)
3. Region: **Frankfurt**
4. Health check path: `/health`
5. Pre-deploy command: `alembic upgrade head`
6. Set env vars (dashboard secrets):

| Key | Production | Staging |
|---|---|---|
| `ENVIRONMENT` | `production` | `staging` |
| `DATABASE_URL` | Neon main pooled | Neon staging pooled |
| `DATABASE_URL_MIGRATIONS` | Neon main direct | Neon staging direct |
| `CLERK_ISSUER` | Prod Clerk issuer | Dev Clerk issuer |
| `CLERK_WEBHOOK_SECRET` | Prod webhook secret | Dev webhook secret |
| `CLERK_JWT_KEY` | Prod PEM (with `\n` or multiline) | Dev PEM |
| `CORS_ORIGINS` | `https://kammerchor-elikuren.de,https://www.kammerchor-elikuren.de` | Vercel staging/preview origins |
| `DOCS_ENABLED` | `false` | `true` |
| `TRUSTED_HOSTS` | `*` or API hostnames | `*` |

7. Custom domain production: `api.kammerchor-elikuren.de`
8. After first deploy, verify:
   - `GET https://api.../health` → 200
   - `GET https://api.../ready` → 200
   - Clerk webhook → `POST https://api.../api/v1/webhooks/clerk`

## 3. Clerk wiring

1. Prefer **separate** Clerk applications for development and production.
2. Session token: add custom claims used by the API (`user_email`, `user_firstname`, …) or rely on optional claims (API tolerates missing profile fields).
3. Webhook endpoints:
   - Prod → production API `/api/v1/webhooks/clerk`
   - Dev → staging API `/api/v1/webhooks/clerk`
4. Allowed origins / redirect URLs must include Vercel production + preview hosts and `http://localhost:3000`.

## 4. Cutover order

1. Deploy staging API → Neon staging → Clerk dev webhook.
2. Point web preview `NEXT_PUBLIC_API_URL` at staging API.
3. Deploy production API → Neon main → Clerk prod webhook.
4. Point web production `NEXT_PUBLIC_API_URL` at production API.
5. Keep Hetzner online until verification, then decommission.
