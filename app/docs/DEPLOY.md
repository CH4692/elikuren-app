# Vercel + Neon deployment (Next.js only)

## Locked decisions

- Hosting: **Vercel only**
- Database: **Neon Frankfurt**
- Auth: **Auth.js** (magic link via Resend)
- Domains: `kammerchor-elikuren.de`
- Production branch: **`main`**
- Preview / staging branch: **`dev`** (and pull-request previews)

## Environments

| Scope | Neon | R2 bucket | Notes |
|-------|------|-----------|--------|
| **Production** (`main`) | Production Neon (real member data) | Production bucket | Live site |
| **Preview** (`dev` / PRs) | Separate Preview Neon | Separate Preview bucket | Never point Preview DB/R2 at Production |
| **GitHub CI** (full suite on `main`) | Same Preview/test Neon via secrets | not required for smoke | Secrets `CI_DATABASE_URL` (+ optional `CI_DATABASE_URL_UNPOOLED`) |

### Env vars: split vs share

| Variable | Production vs Preview |
|----------|------------------------|
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | **Split** — different Neon projects/branches |
| `AUTH_URL` / `SITE_URL` / `NEXT_PUBLIC_SITE_URL` | **Split** — live domain vs Preview URL (`SITE_URL` preferred server-side for emails) |
| `AUTH_SECRET` | **Split** — different secrets |
| `R2_BUCKET_NAME` | **Split** — prod vs preview bucket |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | **Split** if tokens are bucket-scoped |
| `R2_ACCOUNT_ID` / `R2_ENDPOINT` / `R2_REGION` | Share OK (same Cloudflare account) |
| `RESEND_API_KEY` / `EMAIL_FROM` | Share OK |
| `CONTACT_EMAIL_TO` | Share OK (contact-form inbox) |
| `EMAIL_REDIRECT_TO` | Preview/local only — transactional mail redirect; **never** used for magic links |
| `EMAIL_AUTH_ALLOWED_RECIPIENTS` | Preview/local optional — if set, restricts magic-link recipients; unset allows all |

Do **not** set `AUTH_ENABLE_PASSWORD_LOGIN` on Vercel (local/E2E only).

## 1. Neon

1. Create projects (or branches) in **Frankfurt**.
2. Keep the Neon with real member data as **Production**.
3. Create a second Neon for **Preview** (and CI full suite).
4. Copy for each environment:
   - **Pooled** → `DATABASE_URL`
   - **Direct** → `DATABASE_URL_UNPOOLED`
5. Keep `sslmode=require`.

## 2. Migrations (important)

- **Forbidden:** `prisma migrate deploy` locally against Neon Production (or Preview if you are not intentionally updating that DB).
- **Local OK:** `npm run db:migrate:dev` only against a local or dedicated throwaway DB.
- **Vercel (Production and Preview):** migrations run only in the build:

```bash
npx prisma migrate deploy && npm run build
```

(`npm run build` already runs `prisma generate`.)

Ship **schema + app code in the same deploy**. Never migrate Production ahead of the code that understands the new schema (runtime crashes).

Migrations are **forward-only**. A Vercel rollback restores **code**, not the database. Prefer expand-then-contract for breaking schema changes.

## 3. Vercel

1. Import the monorepo; **Root Directory:** `app`.
2. Set env vars per scope (Production vs Preview) — see table above.
3. Build command:

```bash
npx prisma migrate deploy && npm run build
```

4. Production Branch: `main`.
5. Prefer deploying only when the GitHub check **`test`** is green (Deployment Protection / required checks, if available on the plan).
6. After a Production deploy: `GET /api/health` → `auth.*` and `DATABASE_URL` flags should be `true`.

## 4. GitHub CI

| Target | Suite |
|--------|--------|
| PR / push → `dev` | typecheck, lint, build, Playwright **smoke** |
| PR / push → `main` | + **unit tests**, `prisma migrate deploy` on CI DB, Playwright **full** suite |

Repo secrets (never Production Neon):

- `CI_DATABASE_URL` — Preview/test Neon pooled URL
- `CI_DATABASE_URL_UNPOOLED` — direct URL (falls back to pooled if unset)

Branch protection on `main` and `dev`: require status check **`test`**, require PR, **0** approving reviews (solo).

## 5. Auth.js / Resend / transactional email

1. Verify the Resend domain for `EMAIL_FROM` (SPF/DKIM must be checked in Resend before productive sends).
2. Set production `SITE_URL` or `AUTH_URL` to `https://kammerchor-elikuren.de` (required — no silent production fallback).
3. Sign-in / sign-up: `/auth/sign-in`, `/auth/sign-up`
4. Magic-link callback goes through `/api/auth/*`
5. Preview / local safety:
   - Prefer a `re_test*` Resend key in CI (magic links + sends are skipped).
   - Optional `EMAIL_AUTH_ALLOWED_RECIPIENTS` (comma-separated): if set, only those addresses may receive magic links in non-production. If unset, all recipients are allowed.
   - Optional `EMAIL_REDIRECT_TO` redirects **transactional** mail only (contact, membership approval). It is **never** applied to Auth.js magic links (the link authenticates the original recipient).
   - Preview/test environments must not use the production Auth/member database.

Local preview of templates: from `app/`, run `npm run email:dev`.

## 6. Verify after Production deploy

- `https://kammerchor-elikuren.de/api/health`
- Contact form
- Sign-in → Magic Link → Dashboard
- Spot-check branded mail rendering in Gmail, Outlook, and Apple Mail after the first real send
