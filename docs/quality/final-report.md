# QE Final Report — Production-grade baseline (Phase A/B)

## 1. Gap matrix

See [gap-analysis.md](./gap-analysis.md).

## 2. Final test pyramid

Static + supply-chain → Unit (always) → API/UI Playwright → Full E2E on `dev` push / `main` → Scheduled mutation/CodeQL → Shift-Right monitors (Phase C).

## 3. Shift-Left

PR → `dev`: typecheck, lint, unit, audit, build, smoke (routes/health/security/a11y/perf/status/route-integrity) + CodeQL.

## 4. Shift-Right

Documented in [logging-observability.md](./logging-observability.md) / [backlog.md](./backlog.md). **Not wired** (no Sentry/uptime credentials in-repo). Required before claiming production ops maturity.

## 5. Security coverage

Headers, guest AuthZ, sessionVersion contract, serializeUser secret omission, cookie HttpOnly (full suite), CodeQL, npm audit, GitGuardian. CSP/HSTS/DAST deferred with rationale.

## 6. Performance

Blocking TTFB/load + health API latency; soft LCP/CLS report (`PERF_ENFORCE_CWV=1` to harden).

## 7. Accessibility

axe critical/serious on home/sign-in/contact + h1/label/keyboard spot checks; contrast debt tracked.

## 8. Test-data strategy

[test-data-strategy.md](./test-data-strategy.md).

## 9. Mutation

Pilot score **64.4%** (session-security 100%). Scheduled non-blocking. Target ≥70% before soft gate.

## 10. Coverage baseline

`npm run test:unit:coverage` — ~92% statements on included `lib/**` (generated excluded). No hard floor yet.

## 11. CI structure

See workflow README. Full suite: push `dev`/`main`, PR → `main`, `workflow_dispatch`.

## 12. Expected PR runtime

Smoke path historically ~3–5 min; keep ≤10 min target. Full suite ~5–8+ min with DB.

## 13–15. Release gates / DoD / checklist

In [testing-strategy.md](./testing-strategy.md) + [release-checklist.md](./release-checklist.md).

## 16–17. Remaining risks & backlog

No error/uptime monitoring; serverless rate-limit; CMS media-dependent UI; contrast debt; DAST/k6/visual — [backlog.md](./backlog.md).

## 18. Required before selling/deploying to a customer (ops)

1. Green full suite on `dev`  
2. Preview content/media sanity  
3. **Error monitoring + uptime + alerting** (Phase C)  
4. Release checklist completed  
5. Explicit risk acceptance for known debts (xlsx, contrast)

## 19. Optional maturity

Phase D items in backlog.

### Gate classification legend

- **BLOCKING EVERY PR** — smoke Shift-Left set  
- **BLOCKING MAIN/RELEASE** — full E2E + migrate (+ push to `dev`)  
- **REPORT ONLY** — soft CWV, mutation HTML  
- **SCHEDULED** — CodeQL weekly, mutation weekly  
- **MANUAL** — exploratory checklist  
