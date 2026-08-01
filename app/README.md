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
| `.env.test` | Safe placeholders for CI / Playwright | committed |

```bash
cp .env.example .env.local
# fill real values (DB, AUTH_SECRET, RESEND_API_KEY, …)
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
| `GET/PATCH/DELETE /api/me` | Current user (Auth.js session) |
| `POST /api/membership-requests` | Public membership application |
| `GET/PATCH /api/admin/membership-requests` | Admin review (role `vorstand`) |
| `GET/POST /api/admin/contacts` | Adressbuch (`CONTACT_MANAGE`) |
| `GET /api/admin/audit` | Audit-Log (`AUDIT_READ`) |
| `GET /api/admin/scores` · `/api/admin/audio` | Flache Noten-/Audio-Listen |
| `GET/POST /api/auth/*` | Auth.js handlers |
| `POST /api/contact` | Contact form via Resend |
| `GET /api/health` | Health check |

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run build` | `prisma generate` + Next build |
| `npm run db:migrate` | Apply migrations (production/CI) |
| `npm run db:migrate:dev` | Create/apply migrations locally |
| `npm run test:e2e` | Playwright (uses `.env.local`, falls back to `.env.test`) |

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md).
