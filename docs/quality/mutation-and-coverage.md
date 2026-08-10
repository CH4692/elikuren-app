# Mutation Testing & Coverage Baseline

## Coverage (`c8`)

```bash
cd app && npm run test:unit:coverage
```

- Reports: text + `coverage/lcov.info`  
- Includes `lib/**/*.ts`, excludes `lib/generated/**`  
- **No global % gate** — establish baseline; prioritize branch coverage on permissions, session-security-data, CMS schemas, email policy  
- Optional later: Codecov trends (**REPORT ONLY** until useful)

## Mutation pilot (Stryker)

```bash
cd app && npm run test:mutation
```

Mutates:

- `lib/permissions.ts`  
- `lib/session-security-data.ts`  

Runs focused unit tests via command runner.  
Thresholds: high 80 / low 60 / **break null** (does not fail CI).

Scheduled: `.github/workflows/mutation.yml` (weekly + manual), `continue-on-error: true`.

**Pilot result (2026-08-10):** overall **64.4%** — `session-security-data.ts` **100%**, `permissions.ts` **59.6%** (survived mutants mainly on lightly tested helpers like `normalizeEmail` / `isAdminRole`).

**Target before soft gate:** ≥ 70% on the pilot set; strengthen unit tests for survived mutants first.
