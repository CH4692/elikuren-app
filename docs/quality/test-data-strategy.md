# Test Data Strategy

## Goals

Deterministic, isolated, non-production data for unit/integration/E2E with safe cleanup.

## Environments & seeding

| Context | Data source |
|---|---|
| Unit | No DB; pure functions |
| Playwright CI (full) | Preview Neon via `CI_DATABASE_URL`; `global-setup` upserts shared e2e users |
| Playwright CI (smoke) | Placeholder DB OK; setup skips when URL is `127.0.0.1:5432/build` |
| Local | `.env.local` Neon Preview; never Production |

Committed defaults: `app/.env.test` (non-secrets / placeholders only).

## Deterministic users & roles

Defined in `app/tests/helpers/credentials.ts` and ensured by `ensure-e2e-admin.ts`:

| Role | Purpose |
|---|---|
| `e2e-admin@…` (`vorstand`) | Admin CMS, approvals, members |
| `e2e-member@…` (`mitglied`) | Member library/profile |
| `e2e-kassenpruefer@…` | Invoice read / auditor |

Password login is **test-only** (`AUTH_ENABLE_PASSWORD_LOGIN=1` in Playwright webServer). Production uses magic link.

## Markers & cleanup

- Markers: `app/lib/e2e-data-markers.ts` (emails, invoice numbers, membership messages)  
- Cleanup: `global-teardown` + `npm run db:wipe-e2e`  
- Shared fixture users are **kept**; ephemeral `*@example.com` / `E2E-*` rows are wiped  

Preview full wipe: `db:wipe-preview` with host pins (`env-guards`) — never Production.

## Isolation rules

1. No reliance on test order  
2. Prefer unique emails/ids per test (`Date.now()`, random suffix) for created entities  
3. Do not mutate shared fixture users’ roles/active flags without restoring  
4. Workers in CI = 1 today → reduce cross-talk; if raising parallelism, tighten uniqueness  
5. **Forbidden:** production data, copying prod dumps into CI, committing secrets  

## Factories / helpers

Prefer helpers over ad-hoc literals:

- `helpers/auth.ts` — login/logout, membership approval  
- `helpers/api.ts` — invoice/file fixtures  
- `helpers/seed-user.ts` / `seed-temp-user.ts` — CLI upsert (avoids Prisma-in-Playwright ESM issues)  
- `helpers/assets.ts` — public routes & asset asserts  

When adding domains, extend helpers rather than scattering credentials.

## Parallel safety

- CI: single worker  
- Local: 2 workers — avoid shared mutable CMS keys in parallel tests; use unique section payloads or serial `describe`  

## Secrets handling

- Real keys only in GitHub Actions secrets / Vercel / local `.env.local`  
- Tests assert **absence** of password hashes/tokens in JSON where APIs are public-facing  
- Email logs must not include magic-link URLs (see `send-email` safe logger)  
