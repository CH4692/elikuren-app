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

Local dev and full E2E use **Neon** via `.env.local`. CI: smoke on `dev`; full suite on `main` (needs GitHub secrets `CI_DATABASE_URL` / Preview Neon — never Production). See [docs/DEPLOY.md](docs/DEPLOY.md).

```bash
npm run test          # unit + full Playwright locally
```

## Local development

```bash
npm install
npm run db:migrate:dev   # local/throwaway DB only — never migrate Production from your laptop
npm run dev
```

## Auth flow

1. Interessierte stellen unter `/auth/sign-up` eine **Mitgliedsanfrage** (`MembershipRequest`, Status `pending`)
2. Vorstand prüft unter `/admin/requests` (Zugangsanfragen): Stimme, Notiz, Freigabe/Ablehnung
3. Bei Freigabe wird ein `User` (`mitglied`, `isActive`) angelegt; optional Magic-Link-Einladung
4. Login/Magic Link nur für aktive User unter `/auth/sign-in` — sonst neutrale Meldung ohne Enumeration

## Mitglieder- & Admin-Bereich

- Eingeloggt: Avatar-Menü (Dashboard, Profil, Noten, Audio; Admin nur mit Admin-Rechten). Login/„Mitglied werden“ sind ausgeblendet.
- `/admin` nutzt eine eigene Shell mit berechtigungsbasierter Sidebar (ohne Marketing-Navbar).
- Unbekannte `/admin/*`-Pfade werden verweigert.
- Admin-Listen: Table + Drawer/Dialog; flache Datei-Übersichten unter `/admin/scores` und `/admin/audio`.

## API routes

| Route | Purpose |
|---|---|
| `GET/PATCH /api/me` | Current user (Auth.js session) |
| `POST /api/membership-requests` | Public membership application |
| `GET/PATCH /api/admin/membership-requests` | Admin review (role `vorstand`) |
| `GET /api/admin/scores` · `/api/admin/audio` | Flache Noten-/Audio-Listen |
| `GET/POST /api/auth/*` | Auth.js handlers |
| `POST /api/contact` | Contact form via Resend |
| `GET /api/health` | Health check |

## Tests

### Wo läuft was?

| Ort | Was |
|---|---|
| **GitHub `CI`** (`deploy.yml`) | Typecheck, lint, build, public Playwright smoke |
| **Lokal** (`npm run test`) | Unit + volles Playwright inkl. Auth/Admin gegen Neon |

### Befehle

| Befehl | Ebene |
|---|---|
| `npm run test:unit` | Unit |
| `npm run test:e2e` | Playwright (Integration + UI) |
| `npm run test` | Unit + E2E |

E2E-Nutzer: `tests/global-setup.ts` → `tests/ensure-e2e-admin.ts` (braucht Neon in `.env.local`).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run build` | `prisma generate` + Next build |
| `npm run db:migrate` | Apply migrations |
| `npm run db:migrate:dev` | Create/apply migrations locally |
| `npm run test:unit` | Node unit tests |
| `npm run test:e2e` | Playwright (local server or `PLAYWRIGHT_BASE_URL`) |
| `npm run test` | Unit + E2E |

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md).
