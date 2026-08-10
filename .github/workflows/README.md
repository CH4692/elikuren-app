# CI

| Workflow | Trigger | Suite |
|---|---|---|
| `deploy.yml` (`CI` / job `test`) | push/PR on `main`, `dev`; `workflow_dispatch` | see stages |
| `codeql.yml` | push/PR on `main`, `dev` + weekly | CodeQL SAST |
| `mutation.yml` | weekly + `workflow_dispatch` | Stryker pilot (non-blocking report) |

## Stages

| Event | Gates |
|--------|-----------|
| **PR → `dev`** (Shift-Left) | typecheck, lint, unit, dependency audit, build, Playwright **smoke** (routes, health, security, a11y, perf, status/errors, route-integrity) + CodeQL |
| **Push → `dev` / `main`**, **PR → `main`**, **manual dispatch** | + `prisma migrate deploy` on CI DB + **full Playwright** |

Full suite needs GitHub secrets `CI_DATABASE_URL` and optionally `CI_DATABASE_URL_UNPOOLED` (Preview/test Neon — never Production).

Quality strategy: [`docs/quality/testing-strategy.md`](../docs/quality/testing-strategy.md)

Local:

```bash
cd app
npm run test:unit
npm run test:unit:coverage
npm run test:security
npm run test:perf
npm run test:a11y
npm run test:mutation   # pilot; not a PR blocker
```
