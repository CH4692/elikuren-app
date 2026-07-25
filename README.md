# Elikuren

Next.js application for Kammerchor Elikuren.

| Layer | Tech | Hosting |
|---|---|---|
| App (UI + API routes) | Next.js 16 in [`apps/web`](apps/web) | Vercel |
| Database | Neon PostgreSQL (Prisma) | Neon Frankfurt |
| Auth | Clerk | Clerk |
| Email | Resend | Resend |

Domain: `https://kammerchor-elikuren.de`

Former FastAPI / Railway / Hetzner material is under [`archive/`](archive/README.md).

## Local development

```bash
cd apps/web
cp .env.example .env.local
# fill DATABASE_URL (+ DATABASE_URL_UNPOOLED), Clerk Development keys, Resend

npm install
npx prisma migrate deploy
npm run dev
```

Or from the repo root: `make web` (after `make install` and DB env is set).

## Deploy (short)

1. Neon project in Frankfurt → set `DATABASE_URL` / `DATABASE_URL_UNPOOLED` on Vercel
2. Vercel project, Root Directory `apps/web`, build: `npx prisma migrate deploy && npm run build`
3. Clerk Production webhook → `https://kammerchor-elikuren.de/api/webhooks/clerk`
4. Attach domain, then shut down Hetzner

Details: [`apps/web/docs/DEPLOY.md`](apps/web/docs/DEPLOY.md)
