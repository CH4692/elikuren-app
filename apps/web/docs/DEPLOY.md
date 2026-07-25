# Vercel + Neon deployment (Next.js only)

## Locked decisions

- Hosting: **Vercel only** (no Railway / FastAPI)
- Database: **Neon Frankfurt**, fresh schema
- Auth: **Clerk** (separate Development + Production apps)
- Domains: `kammerchor-elikuren.de`
- Clerk webhook: `https://kammerchor-elikuren.de/api/webhooks/clerk`

## 1. Neon

1. Create project in **Frankfurt**.
2. Copy:
   - **Pooled** → `DATABASE_URL`
   - **Direct** → `DATABASE_URL_UNPOOLED`
3. Keep `sslmode=require`.

## 2. Vercel

1. Import the monorepo.
2. **Root Directory:** `apps/web`
3. Production env vars (see `.env.example`).
4. Custom domain: `kammerchor-elikuren.de`
5. After first deploy (or via local migrate against Neon):

```bash
cd apps/web
DATABASE_URL_UNPOOLED="postgresql://…" npm run db:migrate
```

Or add a Vercel build command:

```bash
prisma migrate deploy && prisma generate && next build
```

Recommended production build command in Vercel:

```bash
npx prisma migrate deploy && npm run build
```

(`npm run build` already runs `prisma generate`.)

## 3. Clerk Production

1. Webhook URL: `https://kammerchor-elikuren.de/api/webhooks/clerk`
2. Events: `user.created`, `user.updated`, `user.deleted`
3. Put signing secret in Vercel as `CLERK_WEBHOOK_SECRET`
4. Paths: `/auth/sign-in`, `/auth/sign-up`, redirects to `/dashboard`
5. Allowed origins: production domain (+ `www` if used)

## 4. Verify

- `https://kammerchor-elikuren.de/api/health`
- Contact form
- Sign-in → Dashboard → „Profil laden“
- Clerk webhook delivery logs green

## 5. Hetzner

After DNS points to Vercel and everything works: `terraform destroy` in `archive/hetzner-infra`.
