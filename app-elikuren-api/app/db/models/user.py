from sqlmodel import Field, SQLModel, create_engine, select
from datetime import date, datetime
from app.schemas.enums import Role

class User(SQLModel, table = True):
    __tablename__ = "users"

    id: str = Field(default=None, primary_key=True)
    firstname: str | None = Field(default=None, index=True) 
    lastname: str | None = Field(default=None, index=True) 
    street: str | None = None 
    house_number: str | None = None
    postal_code: str | None = None
    location: str | None = None
    phone: str | None = None
    email: str | None = Field(default=None,index=True, unique=True)
    birthday: date | None = None
    created_at: datetime 
    last_signed_in: datetime | None = None
    updated_at: datetime | None = None
    memeber_since: date | None = None
    role: Role | None = Field(default=Role.MITGLIED)