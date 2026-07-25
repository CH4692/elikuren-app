# elikuren-web

Next.js application for Kammerchor Elikuren (UI + API routes).

- **Hosting:** Vercel
- **Database:** Neon PostgreSQL (Prisma)
- **Auth:** Auth.js (magic link via Resend)
- **Email:** Resend

## Local development

```bash
cp .env.example .env.local
# fill DATABASE_URL, AUTH_SECRET, RESEND_API_KEY, EMAIL_FROM

npm install
npx prisma migrate deploy   # or: npm run db:migrate:dev
npm run dev
```

## API routes

| Route | Purpose |
|---|---|
| `GET/PATCH/DELETE /api/me` | Current user (Auth.js session) |
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
| `npm run test:e2e` | Playwright |

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md).
