from functools import lru_cache
from typing import Annotated, Literal

from pydantic import BeforeValidator, Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _split_csv(value: object) -> object:
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return value


CsvList = Annotated[list[str], NoDecode, BeforeValidator(_split_csv)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "elikuren-api"
    ENVIRONMENT: Literal["development", "test", "staging", "production"] = "development"
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    DATABASE_URL: str = Field(
        ...,
        description="Pooled Postgres URL (Neon pooler or local). Use postgresql+psycopg://",
    )
    DATABASE_URL_MIGRATIONS: str | None = Field(
        default=None,
        description="Direct (non-pooler) URL for Alembic. Falls back to DATABASE_URL.",
    )

    CLERK_ISSUER: str
    CLERK_WEBHOOK_SECRET: str
    CLERK_JWT_KEY: str = Field(
        ...,
        description="Clerk RS256 public key PEM contents (including BEGIN/END lines).",
    )
    CLERK_AUTHORIZED_PARTIES: CsvList = Field(default_factory=list)

    CORS_ORIGINS: CsvList = Field(default_factory=lambda: ["http://localhost:3000"])
    TRUSTED_HOSTS: CsvList = Field(
        default_factory=lambda: ["*"],
        description="Comma-separated hosts, or * to disable host checks (default).",
    )

    API_V1_PREFIX: str = "/api/v1"
    DOCS_ENABLED: bool | None = None

    @field_validator("CLERK_JWT_KEY", mode="before")
    @classmethod
    def normalize_pem(cls, value: object) -> object:
        if isinstance(value, str):
            return value.replace("\\n", "\n").strip()
        return value

    @property
    def migrations_url(self) -> str:
        return self.DATABASE_URL_MIGRATIONS or self.DATABASE_URL

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def enable_docs(self) -> bool:
        if self.DOCS_ENABLED is not None:
            return self.DOCS_ENABLED
        return not self.is_production


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
