from fastapi import APIRouter, HTTPException

from app.db.session import check_database

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok", "service": "elikuren-api"}


@router.get("/ready")
def ready():
    try:
        check_database()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ready", "service": "elikuren-api"}
