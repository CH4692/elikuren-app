from pydantic import BaseModel
from datetime import datetime
from app.schemas.enums import Role

class UserResponse(BaseModel):
    vorname: str
    nachname: str
    straße: str
    hausnummer: str
    postleitzahl: str
    ort: str
    telefon: str
    email: str
    birthday: datetime.date
    member_since: datetime.date
    role: Role

