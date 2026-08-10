# Testing & Quality Strategy — Elikuren

## 1. Purpose

Provide a defensible, risk-based quality system for a customer-facing choir website with authenticated member/admin areas (CMS, media, invoices, membership). Maximize defect detection cost-efficiency; do not maximize test count.

## 2. Product quality goals

- Public site always reachable and content-correct  
- AuthZ cannot be bypassed (guest / member / auditor / board)  
- CMS edits render safely without cache/data corruption  
- Member PII and invoices stay role-gated  
- Releases are explainable: green gates + explicit risk acceptance  

## 3. Scope

- `app/` Next.js application, Prisma schema/migrations, GitHub Actions CI  
- Preview (Neon + R2) and Production (Vercel + Neon + R2)  

## 4. Out of scope (this strategy)

- Full WCAG certification via automation alone  
- Intrusive DAST against Production  
- Load/soak testing until concurrent-user risk justifies it  
- Visual regression of every CMS variant  

## 5. Quality risks (top)

| Risk | Impact | Probability | Notes |
|---|---|---|---|
| AuthZ bypass / IDOR | Critical | Medium | Admin APIs, files, invoices |
| Session not invalidated on role/disable | Critical | Low–Med | `sessionVersion` contract |
| CMS publish breaks public pages | High | Medium | Cache tags, media resolve |
| Email/auth mis-delivery | High | Medium | Magic link, contact |
| Migration breaks Preview/Prod | Critical | Low | Prisma deploy gate |
| Silent production errors | High | Medium | No error monitoring yet |
| Dependency CVE | High | Medium | Audit + Dependabot |

## 6–8. Test levels, types, pyramid

```
        /\
       /E2E\        critical journeys only (auth, CMS, invoices)
      /------\
     / API+UI \     Playwright integration + pages
    /----------\
   /    Unit    \   pure business rules (permissions, schemas, policy)
  /--------------\
 / Static+Supply  \ tsc, eslint, CodeQL, npm audit
```

Types in use: unit, API/integration, UI E2E, smoke, security, a11y, performance budgets, SAST, dependency audit. Mutation + coverage are measurement tools, not vanity KPIs.

## 9. Shift-Left

| Stage | What | Why |
|---|---|---|
| Local / IDE | `typecheck`, `lint`, focused `test:unit` | Cheapest feedback |
| Every PR → `dev` | typecheck, lint, unit, audit, CodeQL, build, Playwright **smoke** (routes, health, security, a11y, perf, status, route-integrity) | Fast gate ≤ ~10 min target |
| Push → `dev` / `main`, PR → `main` | + migrate CI DB + **full** Playwright | Prove release candidate before Production |
| Scheduled | CodeQL weekly; mutation pilot; Dependabot | Depth without blocking every PR |

## 10. Shift-Right

Production quality is not CI-only. Required maturity (Phase C):

- Error monitoring (e.g. Sentry) for server/client exceptions  
- Uptime on `/`, `/auth/sign-in`, `/api/health`  
- Read-only post-deploy smoke  
- Alerts for downtime and elevated 5xx  

See [logging-observability.md](./logging-observability.md) and [backlog.md](./backlog.md).

## 11. Risk-based depth

| Area | Impact | Unit | API/Integ | E2E | Security | Prod monitor |
|---|---|---|---|---|---|---|
| Authentication | Critical | Policy/email | — | Sign-in, approval | Session/cookies | Auth error rate |
| Authorization | Critical | Permissions | AuthZ matrix | Role UI | Guest deny smoke | — |
| CMS write/read | High | Schemas/cache | Site CMS API | Admin CMS pages | — | Public content uptime |
| Media / R2 | High | Keys/delivery | Presign deny | Limited (no real upload in CI) | AuthZ | Asset smoke |
| Invoices | High | Permissions | Features API | Invoice UI | Field leakage | — |
| Contact / email | Medium | Templates/send | Contact 400/503 | Contact UI (mocked send) | No secret logs | Provider failures |
| Marketing pages | Medium | — | — | Smoke + images | Headers | Uptime home |

Trivial UI copy changes: static + smoke; no new E2E required.

## 12. Definition of Done (feature)

- Acceptance criteria met; TypeScript + lint clean  
- Unit tests for new business rules  
- API/integration when crossing a trust boundary  
- E2E only for critical user journeys  
- AuthZ + error handling considered  
- a11y considered for user-facing UI  
- Logging without secrets  
- No new unresolved high/critical CodeQL or audit findings (or documented risk acceptance)  
- CI green for the target stage  

## 13. CI quality gates (classification)

| Gate | Class |
|---|---|
| typecheck / lint errors | **BLOCKING EVERY PR** |
| unit tests | **BLOCKING EVERY PR** |
| npm audit high+ (allowlisted exceptions only) | **BLOCKING EVERY PR** |
| production build | **BLOCKING EVERY PR** |
| Playwright smoke (incl. security/a11y/perf/status/routes) | **BLOCKING EVERY PR** |
| CodeQL high/critical | **BLOCKING MAIN/RELEASE** (fix or risk-accept) |
| Prisma migrate + full E2E | **BLOCKING MAIN/RELEASE** (+ push to `dev`) |
| Soft LCP/CLS budgets | **REPORT ONLY** (unless extreme) |
| Mutation score | **SCHEDULED / MANUAL** |
| Manual exploratory checklist | **MANUAL** |
| Production smoke / uptime | **POST DEPLOY** (Phase C) |

## 14. Test environments

| Env | DB / R2 | Use |
|---|---|---|
| Local | Neon Preview or local | Dev + full `npm run test` |
| GitHub CI | `CI_DATABASE_URL` (Preview Neon) | Full suite |
| Vercel Preview | Preview Neon + Preview R2 | Human + future prod-like smoke |
| Production | Prod Neon + Prod R2 | Read-only monitors only |

Never point CI/Preview wipe tooling at Production (`env-guards`).

## 15. Test data

See [test-data-strategy.md](./test-data-strategy.md).

## 16. Security testing

- App: headers, AuthZ, sessionVersion, rate-limit units, cookie flags (full suite)  
- Supply chain: npm audit, Dependabot, lockfile + `npm ci`  
- SAST: CodeQL `javascript-typescript`  
- Secrets: GitGuardian  
- Not applicable / edge: HSTS often at Vercel; CSP requires deliberate content inventory before enabling  
- Backlog: DAST against Preview  

## 17. Accessibility

- Automated axe (critical/serious) on representative public pages  
- Brand `color-contrast` currently disabled — tracked debt  
- Explicit checks: h1, labeled inputs where relevant  
- Manual keyboard/mobile review on release checklist — automation ≠ WCAG compliance claim  

## 18. Performance

- Blocking: tolerant TTFB/load on public hot paths (`PERF_*_MS`)  
- Soft: LCP/CLS via Performance API when available  
- No k6 until concurrency risk warrants  

## 19. Regression

- Smoke on every PR catches route/header/authz breakage  
- Full suite on `dev` pushes and `main` catches journey regressions before Production  

## 20. Production monitoring

Required before treating Production as “customer-safe ops”: error tracking + uptime + alerting. Details in observability doc.

## 21. Release criteria

**Block release if:** typecheck/lint/unit/build fail; security smoke fails; unresolved high/critical CodeQL; unaccepted audit high; a11y new serious/critical; required E2E fails; migration validation fails.

**Warn (track ticket):** minor perf drift; moderate deps with mitigation; known contrast debt.

Risk acceptance must be written (PR comment or issue), not silent.

## 22. Ownership / maintenance

| Area | Owner |
|---|---|
| CI workflows & gates | DevSecOps / eng lead |
| Unit & domain tests | Feature author |
| Playwright suites | Feature author + QE review on critical paths |
| Flaky tests | Author within 1 week; quarantine only with issue |
| Security findings | Eng lead + security-minded reviewer |
| Strategy docs | Keep current when CI stages change |

### Traceability (critical flows)

| Flow | Primary automation |
|---|---|
| Authentication | `pages/auth`, `pages/approval`, email policy units |
| Authorization | `permissions` units, `api-authz`, security-authz smoke |
| CMS editing | `site-content-*` units, `admin-site-cms*`, `site-cms-api` |
| Member access | `member-area`, `protected`, library pages |
| Media | `file-delivery` / `public-media` units, presign AuthZ |
| Concerts | `concert-*` units, `concerts-api`, public home/concert visibility |

### Metrics (useful)

CI pass rate, flaky count, escaped prod defects, high/critical security open, mutation score (pilot modules), branch coverage on critical modules, PR CI duration, uptime, prod error rate.  
**Not KPIs:** raw test count, 100% line coverage.

See also: [gap-analysis.md](./gap-analysis.md), [mutation-and-coverage.md](./mutation-and-coverage.md), [release-checklist.md](./release-checklist.md), [backlog.md](./backlog.md).
