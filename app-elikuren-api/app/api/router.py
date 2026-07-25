from fastapi import APIRouter

from app.api.routes import health, users, webhook


def build_api_router() -> APIRouter:
    api = APIRouter()
    api.include_router(users.router)
    api.include_router(webhook.router)
    return api


# Health stays outside versioned prefix
health_router = health.router
