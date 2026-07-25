from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.api.deps import get_db
from app.core.security import TokenClaims, get_current_user
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import (
    delete_user,
    get_or_create_user_from_token,
    update_user,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def me(
    token: Annotated[TokenClaims, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return get_or_create_user_from_token(db, token)


@router.patch("/me", response_model=UserResponse)
def update_me(
    body: UserUpdate,
    token: Annotated[TokenClaims, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return update_user(db, token.sub, body)


@router.delete("/me")
def delete_me(
    token: Annotated[TokenClaims, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    delete_user(db, token.sub)
    return {"deleted": True}
