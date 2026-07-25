from datetime import UTC, datetime

from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.security import TokenClaims
from app.db.models.user import User
from app.schemas.user import UserUpdate


def ts_to_datetime(value: int | None) -> datetime | None:
    if value is None:
        return None
    # Clerk may send seconds or milliseconds
    if value > 10_000_000_000:
        value = value / 1000
    return datetime.fromtimestamp(value, tz=UTC)


def get_user_by_clerk_id(db: Session, clerk_id: str) -> User | None:
    statement = select(User).where(User.id == clerk_id)
    return db.exec(statement).first()


def get_or_create_user_from_token(db: Session, token: TokenClaims) -> User:
    existing_user = get_user_by_clerk_id(db, token.sub)
    if existing_user:
        return existing_user

    now = datetime.now(UTC)
    user = User(
        id=token.sub,
        firstname=token.user_firstname,
        lastname=token.user_lastname,
        email=token.user_email,
        phone=token.user_phone_number,
        created_at=ts_to_datetime(token.user_created_at) or now,
        last_signed_in=ts_to_datetime(token.user_last_signed_in),
        updated_at=ts_to_datetime(token.user_updated_at) or now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, clerk_id: str, data: UserUpdate | dict) -> User:
    user = get_user_by_clerk_id(db, clerk_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    payload = data.model_dump(exclude_unset=True) if isinstance(data, UserUpdate) else data
    for key, value in payload.items():
        if hasattr(user, key):
            setattr(user, key, value)

    user.updated_at = datetime.now(UTC)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, clerk_id: str) -> None:
    user = get_user_by_clerk_id(db, clerk_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()


def upsert_user_from_clerk_data(db: Session, data: dict) -> User:
    clerk_user_id = data["id"]
    user = get_user_by_clerk_id(db, clerk_user_id)
    created_at = ts_to_datetime(data.get("created_at")) or datetime.now(UTC)
    updated_at = ts_to_datetime(data.get("updated_at")) or datetime.now(UTC)
    firstname = data.get("first_name")
    lastname = data.get("last_name")

    email = None
    phone = None
    email_addresses = data.get("email_addresses") or []
    if email_addresses:
        primary_id = data.get("primary_email_address_id")
        primary = next(
            (item for item in email_addresses if item.get("id") == primary_id),
            email_addresses[0],
        )
        email = primary.get("email_address")

    phone_numbers = data.get("phone_numbers") or []
    if phone_numbers:
        primary_phone_id = data.get("primary_phone_number_id")
        primary_phone = next(
            (item for item in phone_numbers if item.get("id") == primary_phone_id),
            phone_numbers[0],
        )
        phone = primary_phone.get("phone_number")

    if user is None:
        user = User(
            id=clerk_user_id,
            created_at=created_at,
            firstname=firstname,
            lastname=lastname,
            email=email,
            phone=phone,
            updated_at=updated_at,
        )
        db.add(user)
    else:
        user.firstname = firstname
        user.lastname = lastname
        if email is not None:
            user.email = email
        if phone is not None:
            user.phone = phone
        user.updated_at = updated_at
        db.add(user)

    db.commit()
    db.refresh(user)
    return user
