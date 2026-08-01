# Vercel + Neon deployment (Next.js only)

## Locked decisions

- Hosting: **Vercel only**
- Database: **Neon Frankfurt**, fresh schema
- Auth: **Auth.js** (magic link via Resend)
- Domains: `kammerchor-elikuren.de`

## 1. Neon

1. Create project in **Frankfurt**.
2. Copy:
   - **Pooled** → `DATABASE_URL`
   - **Direct** → `DATABASE_URL_UNPOOLED`
3. Keep `sslmode=require`.

## 2. Vercel

1. Import the monorepo.
2. **Root Directory:** `app`
3. Production env vars (see `.env.example`), especially:
   - `AUTH_SECRET`
   - `AUTH_URL=https://kammerchor-elikuren.de`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
4. Custom domain: `kammerchor-elikuren.de`
5. Build command:

```bash
npx prisma migrate deploy && npm run build
```

(`npm run build` already runs `prisma generate`.)

## 3. Auth.js / Resend

1. Verify the Resend domain for `EMAIL_FROM`
2. Sign-in / sign-up: `/auth/sign-in`, `/auth/sign-up`
3. Magic-link callback goes through `/api/auth/*`

## 4. Verify

- `https://kammerchor-elikuren.de/api/health`
- Contact form
- Sign-in → Magic Link → Dashboard → „Profil laden“
