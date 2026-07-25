# Repository split & cutover

## Extracted repositories

Local clones (fresh import commits) are under:

- [`split-output/elikuren-api`](../split-output/elikuren-api)
- [`split-output/elikuren-web`](../split-output/elikuren-web)

History-preserving branches also exist in this monorepo:

- `split/elikuren-api`
- `split/elikuren-web`

Re-run extraction with history:

```bash
./scripts/split-repos.sh "$HOME/Dokumente - MacBook Air von Charles"
```

## Publish to GitHub

`gh` is not available in this environment. On your machine:

```bash
# API
cd split-output/elikuren-api
# remove any leftover prisma if present in web only
gh repo create elikuren-api --private --source=. --remote=origin --push

# Web
cd ../elikuren-web
rm -rf prisma   # ensure Prisma scaffold is gone
git add -A && git commit -m "Remove unused Prisma scaffold" || true
gh repo create elikuren-web --private --source=. --remote=origin --push
```

Or push to already-created empty remotes:

```bash
git remote add origin git@github.com:<owner>/elikuren-api.git
git push -u origin main
```

## Cutover checklist

1. Create Neon project + branches; set Render env vars (`docs` in API repo).
2. Deploy API on Render (Frankfurt); attach `api.kammerchor-elikuren.de`.
3. Deploy web on Vercel; attach site domain; set `NEXT_PUBLIC_API_URL`.
4. Point Clerk webhooks + allowed origins at the new hosts.
5. Verify `/health`, `/ready`, contact form, and `/api/v1/users/me`.
6. Keep Hetzner online ~1–2 weeks, then `terraform destroy` in `archive/hetzner-infra`.
