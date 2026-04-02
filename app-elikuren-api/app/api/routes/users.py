from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.api.deps import get_db
from typing import Annotated
from app.services.user_service import get_or_create_user_from_token, update_user, delete_user
from sqlmodel import Session

router = APIRouter(prefix="/users", tags=["users"])

SessionDep = Annotated[Session, Depends(get_db)]

@router.get("/me")
def me(user=Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = get_or_create_user_from_token(db, user)
    return db_user

@router.patch("/me")
def update_me(user=Depends(get_current_user),db: Session = Depends(get_db)):
    db_user = update_user(db, user)
    return db_user

@router.delete("/me")
def delete_me(user=Depends(get_current_user),db: Session = Depends(get_db)):
    delete_user(db, user["sub"])
    return {"deleted": True}