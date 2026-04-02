from fastapi import HTTPException
from sqlmodel import Session, select
from datetime import datetime, timezone
from app.db.models.user import User

def ts_to_datetime(value: int | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromtimestamp(value / 1000, tz=timezone.utc)


def get_user_by_clerk_id(db: Session, id: str) -> User | None:
    statement = select(User).where(User.id == id)
    return db.exec(statement).first()


def get_or_create_user_from_token(db: Session, token_payload: dict) -> User:
    clerk_user_id = token_payload["sub"]
    email = token_payload["user_email"]
    firstname = token_payload["user_firstname"]
    lastname = token_payload["user_lastname"]
    phone = token_payload["user_phone_number"]
    created_at = ts_to_datetime(token_payload["user_created_at"])
    last_signed_in = ts_to_datetime(token_payload["user_last_signed_in"])
    updated_at = ts_to_datetime(token_payload["user_updated_at"])

    existing_user = get_user_by_clerk_id(db, clerk_user_id)
    if existing_user:
        return existing_user

    user = User(
        id=clerk_user_id,
        firstname = firstname,
        lastname = lastname,
        email = email,
        phone = phone,
        created_at = created_at,
        last_signed_in = last_signed_in,
        updated_at=updated_at
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, data: dict) -> User:
    user = get_user_by_clerk_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, id: str) -> None:
    user = get_user_by_clerk_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()


def upsert_user_from_clerk_data(db: Session, data: dict) -> User:
    clerk_user_id = data["id"]
    user = get_user_by_clerk_id(db, clerk_user_id)
    created_at = ts_to_datetime(data["created_at"])
    firstname = data["first_name"]
    lastname = data["last_name"]

    if user is None:
        user = User(
            id=clerk_user_id,
            created_at = created_at,
            firstname=firstname,
            lastname=lastname
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return user