# Vercel deployment checklist

1. Create Vercel project from `elikuren-web` GitHub repo.
2. Set Production branch to `main`.
3. Copy variables from [`.env.example`](../.env.example) into:
   - Production
   - Preview
   - Development (optional)
4. Point `NEXT_PUBLIC_API_URL`:
   - Production → Render production API
   - Preview → Render staging API
5. Align Clerk sign-in/sign-up URLs with `/auth/sign-in` and `/auth/sign-up`.
6. Add custom domain and update DNS.
7. Verify `/api/health` and contact form on production.
8. Verify dashboard can load `/api/v1/users/me` with a real Clerk session.
