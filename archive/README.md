# Archived infrastructure

This folder contains the former **Hetzner + Traefik + GHCR pull-deploy** stack.

## Why archived

The project is moving to:

- **elikuren-api** → Render + Neon
- **elikuren-web** → Vercel

Self-managed VPS maintenance (servers, Traefik, systemd timers, Tailscale SSH) is no longer the target operating model.

## Contents

| Path | Former role |
|---|---|
| `hetzner-infra/` | Terraform for `prod-1` / `dev-1` CAX11 servers |
| `deploy/` | Docker Compose, Traefik, systemd update timers, local Postgres volume data |

## Safe decommission checklist (manual)

Do **not** destroy servers until production DNS points at Vercel/Render and you have verified:

1. `https://kammerchor-elikuren.de` serves Vercel
2. `https://api.kammerchor-elikuren.de` serves Render and `/ready` is OK
3. Clerk webhooks hit the Render API
4. Neon holds the production database (or fresh schema is accepted)
5. Optional: keep a final `pg_dump` for 30 days

Then:

```bash
cd archive/hetzner-infra
terraform destroy   # only after backups + DNS cutover
```

Rotate any secrets that lived on the servers (Clerk webhook secrets, DB passwords, GHCR tokens).

## Do not use for new work

- Do not commit `deploy/data/postgres-dev`
- Do not extend Traefik/Hetzner Terraform for the new architecture
