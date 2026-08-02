# CI

| Workflow | Trigger | Suite |
|---|---|---|
| `deploy.yml` (`CI` / job `test`) | push/PR on `main`, `dev` | see below |

| Branch | What runs |
|--------|-----------|
| `dev` | typecheck, lint, build, Playwright smoke |
| `main` | + unit tests, `prisma migrate deploy` on CI DB, full Playwright |

Full suite on `main` needs GitHub secrets `CI_DATABASE_URL` and optionally `CI_DATABASE_URL_UNPOOLED` (Preview/test Neon — never Production).

Local full auth/admin E2E: `cd app && npm run test` with Neon in `.env.local`.
