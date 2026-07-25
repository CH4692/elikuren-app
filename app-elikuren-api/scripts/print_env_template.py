#!/usr/bin/env python3
"""Print a ready-to-paste .env skeleton from optional PEM file path."""

from pathlib import Path


def main() -> None:
    pem_path = Path("keys/clerk_pub.pem")
    pem = ""
    if pem_path.exists():
        pem = pem_path.read_text(encoding="utf-8").strip().replace("\n", "\\n")

    print(
        f"""APP_NAME=elikuren-api
ENVIRONMENT=development
LOG_LEVEL=INFO
DEBUG=true
DATABASE_URL=postgresql+psycopg://elikuren:elikuren@localhost:5432/elikuren
DATABASE_URL_MIGRATIONS=postgresql+psycopg://elikuren:elikuren@localhost:5432/elikuren
CLERK_ISSUER=https://your-clerk-issuer.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_xxx
CLERK_JWT_KEY="{pem or "-----BEGIN PUBLIC KEY-----\\\\n...\\\\n-----END PUBLIC KEY-----"}"
CORS_ORIGINS=http://localhost:3000
TRUSTED_HOSTS=*
API_V1_PREFIX=/api/v1
DOCS_ENABLED=true
"""
    )


if __name__ == "__main__":
    main()
