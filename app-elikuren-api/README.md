# elikuren-api

FastAPI backend for Kammerchor Elikuren.

- **Hosting:** Render (Frankfurt), Docker
- **Database:** Neon PostgreSQL
- **Auth:** Clerk JWT (Bearer) + Clerk webhooks (Svix)

## Local development

```bash
# 1) Start Postgres
docker compose up -d db

# 2) Copy env and fill Clerk values
cp .env.example .env

# 3) Install deps (uv)
uv sync

# 4) Migrate
uv run alembic upgrade head

# 5) Run API
uv run uvicorn app.main:app --reload --port 8000
```

- Health: `GET http://localhost:8000/health`
- Ready: `GET http://localhost:8000/ready`
- Users: `GET/PATCH/DELETE http://localhost:8000/api/v1/users/me`
- Webhook: `POST http://localhost:8000/api/v1/webhooks/clerk`
- Docs (non-production): `http://localhost:8000/docs`

## Environment variables

See [`.env.example`](.env.example).

Important:

- Use Neon **pooled** URL in `DATABASE_URL` for the app.
- Use Neon **direct** URL in `DATABASE_URL_MIGRATIONS` for Alembic / Render pre-deploy.
- `CLERK_JWT_KEY` is the PEM public key contents (not a file path).
- `CORS_ORIGINS` is a comma-separated list (local + Vercel production/preview).

## Tests / lint

```bash
uv sync --group dev
uv run ruff check .
uv run pytest
```

## Deploy (Render)

1. Create a Neon project (Frankfurt) with `main` + `staging` branches.
2. Connect this repo to Render; use [`render.yaml`](render.yaml) or create a Docker Web Service.
3. Set secrets in the Render dashboard.
4. Set **Pre-Deploy Command** to `alembic upgrade head`.
5. Point Clerk production webhook to `https://<api-host>/api/v1/webhooks/clerk`.
6. Attach custom domain `api.kammerchor-elikuren.de`.

## API contract

OpenAPI is served at `/openapi.json` when docs are enabled (staging/dev).
Versioned routes live under `/api/v1`.
