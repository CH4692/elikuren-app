# elikuren-web

Next.js frontend for Kammerchor Elikuren.

- **Hosting:** Vercel (Frankfurt `fra1`)
- **Auth:** Clerk
- **API:** FastAPI backend via `NEXT_PUBLIC_API_URL`
- **Contact email:** Resend (`/api/contact`)

## Local development

```bash
cp .env.example .env.local
# fill Clerk + Resend + API URL

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the API separately (see `elikuren-api`) on port 8000, or point `NEXT_PUBLIC_API_URL` at staging.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run build` / `start` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test:e2e` | Playwright smoke tests |

## Vercel

1. Import this repository into Vercel.
2. Framework preset: Next.js, region Frankfurt.
3. Configure environment variables per environment:

| Variable | Production | Preview |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.kammerchor-elikuren.de` | Staging API URL |
| `NEXT_PUBLIC_SITE_URL` | `https://kammerchor-elikuren.de` | Preview URL / staging |
| Clerk keys | Production Clerk | Development Clerk |
| `RESEND_API_KEY` | production key | shared/dev key |
| Feature flags | as needed | as needed |

4. Attach custom domain `kammerchor-elikuren.de`.
5. In Clerk, allow the Vercel production + preview domains.

Production deploys from `main`. Pull requests get Preview Deployments automatically.

## API contract

Authenticated calls use Clerk session JWT:

```ts
const token = await getToken();
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Helper: [`lib/api.ts`](lib/api.ts).
