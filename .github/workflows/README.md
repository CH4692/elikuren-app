# CI

| Workflow | Trigger | Suite |
|---|---|---|
| `deploy.yml` (`CI` / job `test`) | push/PR on `main`, `dev` | see below |
| `codeql.yml` | push/PR on `main`, `dev` + weekly | CodeQL SAST |

| Branch | What runs |
|--------|-----------|
| `dev` | typecheck, lint, **unit tests**, dependency audit (`scripts/ci-npm-audit.mjs`, high+/critical with documented allowlist), build, Playwright smoke (routes/health/home/content + security/perf/a11y) |
| `main` | + `prisma migrate deploy` on CI DB, full Playwright |

Full suite on `main` needs GitHub secrets `CI_DATABASE_URL` and optionally `CI_DATABASE_URL_UNPOOLED` (Preview/test Neon — never Production).

Local full auth/admin E2E: `cd app && npm run test` with Neon in `.env.local`.

Focused local runs:

```bash
cd app
npm run test:unit
npm run test:security
npm run test:perf
npm run test:a11y
```
