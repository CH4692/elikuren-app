# elikuren-api

FastAPI backend for Kammerchor Elikuren.

- **Hosting:** Railway (Docker), Root Directory `apps/api`
- **Database:** Neon PostgreSQL (Frankfurt)
- **Auth:** Clerk JWT (Bearer) + Clerk webhooks (Svix)

## Local development

```bash
docker compose up -d db
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

- Health: `GET http://localhost:8000/health`
- Ready: `GET http://localhost:8000/ready`
- Users: `GET/PATCH/DELETE /api/v1/users/me`
- Webhook: `POST /api/v1/webhooks/clerk`

## Tests

```bash
uv sync --group dev
uv run ruff check .
uv run pytest
```

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md) and [railway.toml](railway.toml).
