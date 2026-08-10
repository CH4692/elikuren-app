# Quality Gap Analysis (Audit)

Audit date: 2026-08-10  
Scope: `elikuren-app` (Next.js App Router, Auth.js, Prisma/Neon, R2, Resend, Vercel)

## Matrix

| Quality area | Existing coverage | Missing coverage | Risk | Recommended action | CI stage |
|---|---|---|---|---|---|
| Static quality | `tsc`, ESLint on every CI | Error/not-found boundaries absent | Medium | Track branded `error.tsx` / `not-found.tsx` | PR (static) / backlog UI |
| Unit | ~30 files, business logic (permissions, CMS schemas, email policy, rate-limit, session bump) | No coverage report / mutation signal | Medium | Baseline `c8` + Stryker pilot on critical pure modules | PR (unit); mutation scheduled/manual |
| Integration / API | Playwright API flows (membership, concerts, CMS, invoices, health) | Shared response-schema contracts; contact rate-limit e2e | High (authz/CMS) | Keep Playwright; add focused schema/status cases where thin | Full suite |
| E2E | Strong pages suite (auth, admin CMS, invoices, members) | Chromium-only; magic-link delivery not asserted | High (auth) | Chromium every PR; cross-browser on release | PR smoke / Full / scheduled |
| Regression | Full Playwright when `CI_FULL` | Doc drift (DEPLOY still said smoke-on-dev) | Medium | Align docs + stage model | Docs + CI |
| Accessibility | axe smoke (`/home`, sign-in, contact); contrast waived | Authenticated surfaces; keyboard nav asserts | Medium | Expand axe + explicit label/h1 checks; manual AA review | PR smoke + manual release |
| Security | Headers smoke, guest AuthZ, sessionVersion unit, CodeQL, npm audit, GitGuardian, env-guards | CSP/HSTS app-level, durable rate-limit, cookie-flag e2e, IDOR depth, DAST | High | Cookie/session regression; document CSP/HSTS at edge; DAST backlog | PR + Full + scheduled |
| Performance | TTFB/load budgets on hot public routes | Noisy CWV gates; no API latency smoke | Medium | Soft LCP/CLS report; keep tolerant TTFB/load | PR smoke |
| Resilience / errors | Some API status asserts | Structured 404/401/400 smokes; no chaos | Medium | Status/error smoke suite | PR smoke |
| Test data | Marker wipe, seeded e2e roles, `.env.test` placeholders | Factory naming inconsistent; parallel workers=1 only | Medium | Formalize strategy; keep markers | Docs + helpers |
| Observability | `/api/health` config presence; `console.error` | No Sentry/uptime/APM/alerts | **Critical for ops** | Shift-Right plan (Sentry + uptime) | Post-deploy / Phase C |
| Dependency / supply-chain | `npm ci`, lockfile, Dependabot, audit allowlist, CodeQL | Action pin policy informal | Medium | Keep; document risk acceptance for `xlsx` | PR + weekly |
| Release quality | Vercel Preview; full suite path | No formal release checklist / prod smoke | High | Release criteria + manual checklist + prod smoke plan | Manual + post-deploy |
| Production monitoring | None in-repo | Uptime, error rate, CWV field | **Critical for customers** | External monitors; read-only prod smoke | Phase C |

## Confirmed Phase A gaps (implement now)

1. Formal strategy + risk + test-data + logging docs  
2. CI stage model: fast PR → `dev`; **full suite on push to `dev`/`main` and PRs to `main`** (before promote)  
3. Route/status/error smokes (no duplicates of existing AuthZ matrix)  
4. Internal route-integrity smoke  
5. Soft CWV metrics (report / tolerant)  
6. Cookie/session security regression (full suite)  
7. Fix full-suite flake/failure blockers (`features` CMS image, login locator)  
8. Align `DEPLOY.md` / workflow README  

## Deferred (risk-based)

- CSP/HSTS in Next config if already enforceable at Vercel — document first  
- DAST (ZAP), k6, Lighthouse CI, visual regression, Codecov — Phase D  
- Live Resend/R2 happy-path E2E — needs secrets + cost control  
