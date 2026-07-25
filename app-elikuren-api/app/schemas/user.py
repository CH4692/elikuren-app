from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.enums import Role


class UserUpdate(BaseModel):
    firstname: str | None = None
    lastname: str | None = None
    street: str | None = None
    house_number: str | None = None
    postal_code: str | None = None
    location: str | None = None
    phone: str | None = None
    email: str | None = None
    birthday: date | None = None
    member_since: date | None = None
    role: Role | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    firstname: str | None = None
    lastname: str | None = None
    street: str | None = None
    house_number: str | None = None
    postal_code: str | None = None
    location: str | None = None
    phone: str | None = None
    email: str | None = None
    birthday: date | None = None
    created_at: datetime
    last_signed_in: datetime | None = None
    updated_at: datetime | None = None
    member_since: date | None = None
    role: Role | None = None
