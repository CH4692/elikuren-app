# Elikuren

Next.js application for Kammerchor Elikuren.

| Layer | Tech | Hosting |
|---|---|---|
| App (UI + API routes) | Next.js 16 in [`apps/web`](apps/web) | Vercel |
| Database | Neon PostgreSQL (Prisma) | Neon Frankfurt |
| Auth | Auth.js (magic link) | Resend |
| Email | Resend | Resend |

Domain: `https://kammerchor-elikuren.de`

## Local development

```bash
cd apps/web
cp .env.example .env.local
# fill DATABASE_URL (+ DATABASE_URL_UNPOOLED), AUTH_SECRET, Resend

npm install
npx prisma migrate deploy
npm run dev
```

Or from the repo root: `make web` (after `make install` and DB env is set).

## Deploy (short)

1. Neon project in Frankfurt → set `DATABASE_URL` / `DATABASE_URL_UNPOOLED` on Vercel
2. Vercel project, Root Directory `apps/web`, build: `npx prisma migrate deploy && npm run build`
3. Set `AUTH_SECRET`, `AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`
4. Attach domain

Details: [`apps/web/docs/DEPLOY.md`](apps/web/docs/DEPLOY.md)
