import jwt
from fastapi import Header, HTTPException, status
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pydantic import BaseModel, ConfigDict, ValidationError

from app.core.settings import settings


class TokenClaims(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sub: str
    user_email: str | None = None
    user_firstname: str | None = None
    user_lastname: str | None = None
    user_phone_number: str | None = None
    user_created_at: int | None = None
    user_last_signed_in: int | None = None
    user_updated_at: int | None = None
    azp: str | None = None
    aud: str | list[str] | None = None


def get_current_user(authorization: str | None = Header(default=None)) -> TokenClaims:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization",
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.CLERK_JWT_KEY,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            options={"verify_aud": False},
        )
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        ) from exc
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc

    if settings.CLERK_AUTHORIZED_PARTIES:
        azp = payload.get("azp")
        if azp and azp not in settings.CLERK_AUTHORIZED_PARTIES:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized party",
            )

    try:
        return TokenClaims.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
        ) from exc
