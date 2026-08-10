# Quality Backlog (Phased)

## Phase C — Shift-Right (ops)

| Item | Class | Notes |
|---|---|---|
| Sentry (or equivalent) server+client | POST DEPLOY | Needs DSN + scrubbing config |
| Uptime monitors (home, sign-in, health) | POST DEPLOY | External SaaS |
| Read-only production smoke workflow | POST DEPLOY | `workflow_dispatch` + prod URL secrets |
| Alerting runbook | MANUAL | Downtime / 5xx / auth provider down |
| Branded `error.tsx` / `not-found.tsx` | PR | UX resilience |

## Phase D — Future / risk-driven

| Item | When justified |
|---|---|
| OWASP ZAP baseline vs Preview | Before major public launch hardening |
| k6/Artillery soak | If traffic/concurrency rises |
| Lighthouse CI vs Preview URL | Marketing performance SLAs |
| Visual regression (home, ensemble, CMS editor) | After CMS churn stabilizes |
| Full WebKit/Firefox matrix nightly | When Chromium-only escapes appear |
| Live Resend + R2 upload E2E | Staging secrets + cost control |
| Codecov / coverage trends | If coverage baseline proves useful |
| Durable rate-limit (Redis/KV) | Contact + auth abuse on serverless |
| CSP rollout | After script/style inventory |

## Explicit non-goals (now)

- Pact consumer-driven contracts (no multi-repo consumers)  
- 100% coverage mandates  
- Active DAST against Production  
