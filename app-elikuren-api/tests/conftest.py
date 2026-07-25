import os

# Must run before app imports
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://elikuren:elikuren@localhost:5432/elikuren_test",
)
os.environ.setdefault("CLERK_ISSUER", "https://example.clerk.accounts.dev")
os.environ.setdefault("CLERK_WEBHOOK_SECRET", "whsec_test")
os.environ.setdefault(
    "CLERK_JWT_KEY",
    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1L7VLPHC"
    "gNhWRCLJW5/znw\n-----END PUBLIC KEY-----",
)
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("TRUSTED_HOSTS", "*")
os.environ.setdefault("DOCS_ENABLED", "true")

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.core.settings import get_settings
from app.main import create_app

get_settings.cache_clear()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    get_settings.cache_clear()
    app = create_app()
    with TestClient(app) as test_client:
        yield test_client
