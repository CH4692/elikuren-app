# Logging & Observability

## Current state

- Unstructured `console.error` / `console.warn` in API routes, CMS, email helper  
- `/api/health` returns liveness + **boolean** config presence (no secret values)  
- No Sentry/OpenTelemetry/uptime product wired in-repo  

## Logging policy

### Do log

- Unexpected server failures (caught exceptions at route boundary)  
- External provider failures (Resend, R2) with **safe** fields (event name, codes, ids)  
- Auth security signals that help ops (e.g. denied magic-link allowlist) without tokens  
- CMS public-render failures that yield incomplete pages  

### Do not log

- Passwords, password hashes  
- Session tokens, magic-link URLs, raw `AUTH_SECRET`  
- Full request bodies containing PII when avoidable  
- Entire env objects  

Email helper already documents safe fields (`[email]` payload without URLs/tokens). Keep that contract.

## Health / readiness

| Check | Today | Target |
|---|---|---|
| Process responds | `GET /api/health` → `status: ok` | Keep |
| Config presence | booleans for auth/R2 | Keep (recon-limited) |
| DB ping | Not in health | Optional private readiness later — do not expose internals publicly |

Public health must stay free of connection strings, versions that aid attackers, and stack traces.

## Shift-Right plan (Phase C — implement when accounts exist)

1. **Error monitoring** — Sentry (or equivalent) for server + client; attach release SHA; scrub auth cookies/headers  
2. **Uptime** — external check every 1–5 min on `/home`, `/auth/sign-in`, `/api/health`  
3. **Alerting** — page on downtime; ticket on elevated 5xx  
4. **Post-deploy smoke** — read-only script/workflow against Preview/Production URLs  

Do not enable vendors in CI without org credentials; track in [backlog.md](./backlog.md).
