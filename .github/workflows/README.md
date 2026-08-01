# CI

| Workflow | Trigger | Purpose |
|---|---|---|
| `web-ci.yml` | push/PR on `app/**` | Lint, typecheck, unit tests, Next.js build (no DB, no Playwright) |
| `e2e-preview.yml` | Vercel Preview `deployment_status` (or manual) | Playwright against the live Preview URL |

## Best practice (this repo)

1. **Every PR/push:** fast static checks (`web-ci`) — no Neon, no browser.
2. **Locally:** full suite with `npm run test` against your Neon via `.env.local`.
3. **Preview:** after Vercel deploys a Preview, Playwright hits that URL (`e2e-preview`).

Deploy: **Vercel** (Root Directory `app`) + **Neon**.

### Secrets for `e2e-preview`

| Secret | Why |
|---|---|
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Seed E2E users in the same Neon DB the Preview uses |
| `AUTH_SECRET` | Consistent with app (seed helpers) |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Optional — only if Vercel Deployment Protection is on |

Manual run: Actions → **e2e-preview** → Run workflow → paste Preview URL.
