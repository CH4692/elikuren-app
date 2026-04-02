import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from fastapi import Header, HTTPException, status

from app.core.config import settings

def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization")

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.CLERK_JWT_KEY,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")