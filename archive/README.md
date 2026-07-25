# Archived material

| Path | Former role |
|---|---|
| `fastapi-api/` | FastAPI backend (replaced by Next.js route handlers) |
| `hetzner-infra/` | Hetzner Terraform |
| `deploy/` | Traefik / Compose pull-deploy |
| `legacy-render.yaml` | Render blueprint |
| `split-output/`, `split-repos.sh`, `SPLIT_AND_CUTOVER.md` | Abandoned two-repo split |

## Current stack

- Next.js in `apps/web` on **Vercel**
- Postgres on **Neon** (Frankfurt)
- Auth via **Clerk**

## Decommission Hetzner

After the site runs on Vercel:

```bash
cd archive/hetzner-infra
terraform destroy
```
