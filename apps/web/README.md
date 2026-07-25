# elikuren-web

Next.js application for Kammerchor Elikuren (UI + API routes).

- **Hosting:** Vercel
- **Database:** Neon PostgreSQL (Prisma)
- **Auth:** Clerk
- **Email:** Resend

## Local development

```bash
cp .env.example .env.local
# fill DATABASE_URL, Clerk Development keys, Resend

npm install
npx prisma migrate deploy   # or: npm run db:migrate:dev
npm run dev
```

## API routes

| Route | Purpose |
|---|---|
| `GET/PATCH/DELETE /api/me` | Current user (Clerk session) |
| `POST /api/webhooks/clerk` | Clerk user sync |
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
