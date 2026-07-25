from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.db.session import get_session


def get_db() -> Generator[Session, None, None]:
    yield from get_session()


SessionDep = Annotated[Session, Depends(get_db)]
