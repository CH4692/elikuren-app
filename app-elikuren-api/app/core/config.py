import os
from pathlib import Path

class Settings:
    def __init__(self):
        self.CLERK_ISSUER = os.getenv("CLERK_ISSUER")
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

        key_path = Path("/app/keys/clerk_pub.pem")

        if not key_path.exists():
            raise RuntimeError(f"JWT key not found at {key_path}")

        with open(key_path, "r", encoding="utf-8") as f:
            self.CLERK_JWT_KEY = f.read()

settings = Settings()