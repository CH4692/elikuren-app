# elikuren-web

Next.js application for Kammerchor Elikuren (UI + API routes).

- **Hosting:** Vercel
- **Database:** Neon PostgreSQL (Prisma)
- **Auth:** Auth.js (magic link via Resend)
- **Email:** Resend

## Environment files

| File | Purpose | Git |
|---|---|---|
| `.env.example` | Template for new setups | committed |
| `.env.local` | Local secrets (Next.js + Prisma) | ignored |
| `.env.test` | Non-secret Playwright/CI defaults (E2E users, auth placeholders) | committed |

```bash
cp .env.example .env.local
# Neon DATABASE_URL + DATABASE_URL_UNPOOLED, AUTH_SECRET, RESEND_API_KEY, …
```

Tests and local dev use **Neon** via `.env.local` (same as production). No local Postgres/Docker required.

```bash
npm run db:migrate
npm run test
```

## Local development

```bash
npm install
npx prisma migrate deploy   # or: npm run db:migrate:dev
npm run dev
```

## Auth flow

1. Interessierte stellen unter `/auth/sign-up` eine **Mitgliedsanfrage** (`MembershipRequest`, Status `pending`)
2. Vorstand prüft unter `/admin/requests` (Zugangsanfragen): Stimme, Notiz, Freigabe/Ablehnung
3. Bei Freigabe wird ein `User` (`mitglied`, `isActive`) angelegt; optional Magic-Link-Einladung
4. Login/Magic Link nur für aktive User unter `/auth/sign-in` — sonst neutrale Meldung ohne Enumeration

## Mitglieder- & Admin-Bereich

- Eingeloggt: Avatar-Menü (Dashboard, Profil, Noten, Audio, Termine, Mitteilungen; Admin nur mit Admin-Rechten). Login/„Mitglied werden“ sind ausgeblendet.
- `/admin` nutzt eine eigene Shell mit berechtigungsbasierter Sidebar (ohne Marketing-Navbar).
- Neue Permissions: `CONTACT_MANAGE`, `AUDIT_READ` (Vorstand). Unbekannte `/admin/*`-Pfade werden verweigert.
- Kontakte sind ein separates Prisma-Modell `Contact` (optional `linkedUserId`); Auth/Rollen bleiben auf `User`.
- Admin-Listen: Table + Drawer/Dialog; flache Datei-Übersichten unter `/admin/scores` und `/admin/audio`.

## API routes

| Route | Purpose |
|---|---|
| `GET/PATCH /api/me` | Current user (Auth.js session) |
| `POST /api/membership-requests` | Public membership application |
| `GET/PATCH /api/admin/membership-requests` | Admin review (role `vorstand`) |
| `GET/POST /api/admin/contacts` | Adressbuch (`CONTACT_MANAGE`) |
| `GET /api/admin/audit` | Audit-Log (`AUDIT_READ`) |
| `GET /api/admin/scores` · `/api/admin/audio` | Flache Noten-/Audio-Listen |
| `GET/POST /api/auth/*` | Auth.js handlers |
| `POST /api/contact` | Contact form via Resend |
| `GET /api/health` | Health check |

## Tests

Drei Ebenen — Integration/UI brauchen eine erreichbare **Neon**-Datenbank (lokal via `.env.local`; CI via **Repository Secrets** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET` — nicht Environment Secrets):

| Befehl | Ebene | Was wird geprüft |
|---|---|---|
| `npm run test:unit` | Unit | Permissions, Rate-Limits, Geldformat, Upload-Validierung, neutrale Membership-Texte |
| `npm run test:integration` | Integration | API-Flows ohne Browser (Membership, Mitglieder, Library, Ankündigungen, Events, Rechnungen, Kontakte, Audit) |
| `npm run test:ui` | UI | Playwright-Seitenflows (Login, Admin, Mitgliederbereich, Marketing-Smoke) |
| `npm run test` | Alle | Unit → Integration → UI nacheinander |

### Abdeckung nach Feature

| Modul | Unit | Integration | UI |
|---|---|---|---|
| **Membership / Auth** | `membership-requests`, `rate-limit`, `admin-access` | `integration/membership-api` | `pages/approval`, `pages/auth`, `pages/membership` |
| **Permissions / Dateien** | `permissions`, `invoice-permissions` | `pages/api-authz` (UI+API) | — |
| **Mitglieder (Admin)** | — | `integration/membership-api` | `pages/members` |
| **Profil** | — | — | `pages/profile` |
| **Dashboard** | — | — | `pages/dashboard` |
| **Library (Noten/Audio)** | `permissions` (accessScope) | `integration/features-api` | `pages/library`, `pages/pieces` |
| **Ankündigungen** | — | `integration/features-api` | `pages/announcements` |
| **Termine / RSVP** | — | `integration/features-api` | `pages/events` |
| **Rechnungen** | `invoice-permissions`, `money` | `integration/features-api` | `pages/invoices` |
| **Kontakte / Audit** | `contact-types` | `integration/admin-api` | `pages/contacts-admin` |
| **Admin-Shell / Nav** | — | `integration/admin-api` (health) | `pages/member-area`, `pages/profile`, `smoke/nav` |
| **Marketing / Smoke** | — | — | `pages/home`, `pages/contact`, `smoke/*` |

E2E-Testnutzer werden in `tests/global-setup.ts` via `tests/ensure-e2e-admin.ts` angelegt (Admin, Mitglied, Kassenprüfer).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run build` | `prisma generate` + Next build |
| `npm run db:migrate` | Apply migrations (production/CI) |
| `npm run db:migrate:dev` | Create/apply migrations locally |
| `npm run test:unit` | Node unit tests (`tsx --test`) |
| `npm run test:integration` | Playwright API integration tests |
| `npm run test:ui` | Playwright UI tests |
| `npm run test` | All test layers |
| `npm run test:e2e` | All Playwright tests (integration + UI) |

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md).
