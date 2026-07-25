# Neon + Railway setup

Secrets stay in the Railway / Neon / Clerk dashboards — never commit them.

## Decisions (locked)

- Neon region: **Frankfurt**
- Railway: **production only** (no staging service for now)
- Clerk: **separate** Development + Production applications
- Database: **fresh schema** (no Hetzner data migration)
- Domains: `kammerchor-elikuren.de`, `api.kammerchor-elikuren.de`
- Hetzner: **shut down** after cutover (no parallel run)

## 1. Neon (Frankfurt)

1. Create project `elikuren` in **Frankfurt (eu-central-1)**.
2. Use the default production branch (optionally a `dev` branch for cloud-backed local work).
3. Copy:
   - **Pooled** connection string → `DATABASE_URL`
   - **Direct** connection string → `DATABASE_URL_MIGRATIONS`
4. Convert scheme to `postgresql+psycopg://…` if needed.
5. Keep SSL (`sslmode=require`).

Fresh schema:

```bash
uv run alembic upgrade head
```

(Railway also runs this as `releaseCommand`.)

## 2. Railway

1. New project from this GitHub monorepo.
2. Service settings:
   - **Root Directory:** `apps/api`
   - Builder: Dockerfile (`railway.toml`)
   - Health check: `/health`
   - Release command: `alembic upgrade head`
3. Set environment variables (Production):

| Key | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `LOG_LEVEL` | `INFO` |
| `DEBUG` | `false` |
| `DOCS_ENABLED` | `false` |
| `API_V1_PREFIX` | `/api/v1` |
| `TRUSTED_HOSTS` | `*` (tighten later) |
| `DATABASE_URL` | Neon pooled |
| `DATABASE_URL_MIGRATIONS` | Neon direct |
| `CLERK_ISSUER` | **Production** Clerk issuer |
| `CLERK_WEBHOOK_SECRET` | **Production** webhook secret |
| `CLERK_JWT_KEY` | **Production** JWT public PEM |
| `CORS_ORIGINS` | `https://kammerchor-elikuren.de,https://www.kammerchor-elikuren.de,http://localhost:3000` |
| `CLERK_AUTHORIZED_PARTIES` | optional frontend origins |

4. Custom domain: `api.kammerchor-elikuren.de`
5. Verify:
   - `GET https://api.kammerchor-elikuren.de/health`
   - `GET https://api.kammerchor-elikuren.de/ready`

## 3. Clerk (Production app)

1. Webhook: `https://api.kammerchor-elikuren.de/api/v1/webhooks/clerk`
2. Allowed origins / redirect URLs: production site + `http://localhost:3000` only on the **Development** Clerk app
3. Use Development Clerk keys locally; Production keys only on Railway/Vercel Production

## 4. Cutover

1. Deploy API on Railway + run migrations (release command).
2. Deploy web on Vercel with `NEXT_PUBLIC_API_URL=https://api.kammerchor-elikuren.de`.
3. Point DNS for both domains.
4. Switch Clerk Production webhook/origins.
5. Shut down Hetzner (`archive/hetzner-infra` → `terraform destroy`).
