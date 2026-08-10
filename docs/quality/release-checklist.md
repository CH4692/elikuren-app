# Manual / Exploratory Release Checklist

Automation does not replace a short human pass before Production promote (`dev` → `main`).

## Before promote

- [ ] CI green on latest `dev` **full** suite (push to `dev`)  
- [ ] No open high/critical CodeQL without risk acceptance  
- [ ] Migrations reviewed; Preview already migrated successfully  
- [ ] Vercel Preview spot-check of changed pages  

## Exploratory focus (changed + adjacent)

- [ ] Changed feature happy path  
- [ ] One adjacent regression (nav, auth, or CMS public render)  
- [ ] Mobile layout (~375px) for touched public pages  
- [ ] Keyboard: skip to primary nav / form submit on touched flows  
- [ ] Content correctness (names, dates, links) for CMS edits  
- [ ] Guest cannot open `/admin`  
- [ ] Member cannot open admin APIs (spot-check)  

## After Production deploy

- [ ] `/home` loads  
- [ ] `/auth/sign-in` renders  
- [ ] `/api/health` → ok  
- [ ] Critical public image/asset loads  
- [ ] (When available) Sentry/uptime quiet  

## Flaky test policy

- Do not “retry until green” as a merge strategy  
- Retries in CI (Playwright ×2) are for infra noise only  
- Flake → issue within 1 week; quarantine only with owner + expiry  
