# Elikuren

Next.js application for Kammerchor Elikuren.

| Layer | Tech | Hosting |
|---|---|---|
| App (UI + API routes) | Next.js 16 in [`app`](app) | Vercel |
| Database | Neon PostgreSQL (Prisma) | Neon Frankfurt |
| Auth | Auth.js (magic link) | Resend |
| Email | Resend | Resend |

Domain: `https://kammerchor-elikuren.de`

## Local development

```bash
cd app
cp .env.example .env.local   # then fill secrets
# CI/Playwright use committed .env.test

npm install
npx prisma migrate deploy
npm run dev
```

## Deploy (short)

1. Neon project in Frankfurt → set `DATABASE_URL` / `DATABASE_URL_UNPOOLED` on Vercel
2. Vercel project, Root Directory `app`, build: `npx prisma migrate deploy && npm run build`
3. Set `AUTH_SECRET`, `AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`
4. Attach domain

Details: [`app/docs/DEPLOY.md`](app/docs/DEPLOY.md)
