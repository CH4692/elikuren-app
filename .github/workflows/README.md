# Legacy CI (monorepo)

These workflows build GHCR images for the former Hetzner pull-deploy path.

After the repository split:

- Use `elikuren-api/.github/workflows/ci.yml` + Render Git deploy
- Use `elikuren-web/.github/workflows/ci.yml` + Vercel Git deploy

`build-api.yml` / `build-web.yml` can be disabled once Render/Vercel are live.
