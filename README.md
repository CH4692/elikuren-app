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

Extracted local repos (ready to push):

- [`split-output/elikuren-api`](split-output/elikuren-api)
- [`split-output/elikuren-web`](split-output/elikuren-web)

History branches in this monorepo: `split/elikuren-api`, `split/elikuren-web`.

Full cutover steps: [docs/SPLIT_AND_CUTOVER.md](docs/SPLIT_AND_CUTOVER.md)

```bash
./scripts/split-repos.sh
```

Deploy docs:

- [app-elikuren-api/docs/DEPLOY.md](app-elikuren-api/docs/DEPLOY.md)
- [app-elikuren-web/docs/DEPLOY.md](app-elikuren-web/docs/DEPLOY.md)

