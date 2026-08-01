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
3. Env vars for **Production and Preview** (see `.env.example`). Preview deployments do **not** inherit Production-only vars:
   - `AUTH_SECRET`
   - `AUTH_URL` — must match the public URL (e.g. `https://elikuren.charlesheller.dev` on Preview)
   - `RESEND_API_KEY` (or `AUTH_RESEND_KEY`)
   - `EMAIL_FROM` — domain must be verified in Resend
   - `DATABASE_URL` / `DATABASE_URL_UNPOOLED`
4. Custom domain (e.g. `elikuren.charlesheller.dev` / `kammerchor-elikuren.de`)
5. Check `GET /api/health` → `auth.*` flags should all be `true`
6. Build command:

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
