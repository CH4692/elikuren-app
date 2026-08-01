# CI

| Workflow | Trigger | Purpose |
|---|---|---|
| `web-ci.yml` (`CI`) | push/PR on `app/**` | Typecheck, lint, build, public Playwright smoke |

Mirrors [charles-portfolio](https://github.com/CH4692/charles-portfolio) CI: no Neon, no auth E2E on the runner.

Full Playwright (membership, admin, …) is run **locally**:

```bash
cd app
npm run test
```

Deploy: **Vercel** (Root Directory `app`) + **Neon**.
