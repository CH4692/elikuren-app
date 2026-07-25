# elikuren-app (monorepo — being split)

Kammerchor Elikuren application monorepo. Target architecture:

| Repo / service | Stack | Hosting |
|---|---|---|
| `elikuren-api` (from `app-elikuren-api/`) | FastAPI + SQLModel + Alembic | Render + Neon |
| `elikuren-web` (from `app-elikuren-web/`) | Next.js + Clerk + Resend | Vercel |

Hetzner / Traefik infrastructure is archived under [`archive/`](archive/README.md).

## Local development (still in monorepo)

### API

```bash
cd app-elikuren-api
cp .env.example .env
docker compose up -d db
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

### Web

```bash
cd app-elikuren-web
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`.

## Split into two Git repositories

```bash
chmod +x scripts/split-repos.sh
./scripts/split-repos.sh
```

This creates sibling folders `../elikuren-api` and `../elikuren-web` with history via `git subtree split`. Then create GitHub remotes and connect Render / Vercel.

Deploy docs:

- [app-elikuren-api/docs/DEPLOY.md](app-elikuren-api/docs/DEPLOY.md)
- [app-elikuren-web/docs/DEPLOY.md](app-elikuren-web/docs/DEPLOY.md)
