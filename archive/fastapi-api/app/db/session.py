from collections.abc import Generator

from sqlalchemy import text
from sqlmodel import Session, create_engine

from app.core.settings import settings


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


# Small pool for a single Uvicorn worker behind Neon pooler.
engine = create_engine(
    _normalize_database_url(settings.DATABASE_URL),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=3,
    max_overflow=2,
)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def check_database() -> bool:
    with Session(engine) as session:
        session.execute(text("SELECT 1"))
    return True
