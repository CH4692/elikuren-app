# CI

Same shape as [charles-portfolio](https://github.com/CH4692/charles-portfolio): typecheck, lint, build, Playwright.

| Workflow | Trigger |
|---|---|
| `deploy.yml` (`CI`) | push/PR on `main`, `dev` |

Full auth/admin E2E runs locally against Neon (`cd app && npm run test`).
