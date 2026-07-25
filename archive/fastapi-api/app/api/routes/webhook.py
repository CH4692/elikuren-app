import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session
from svix.webhooks import Webhook, WebhookVerificationError

from app.api.deps import get_db
from app.core.settings import settings
from app.services.user_service import delete_user, upsert_user_from_clerk_data

logger = logging.getLogger("elikuren.api.webhooks")

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk")
async def clerk_webhook(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
):
    payload = await request.body()
    headers = dict(request.headers)

    try:
        wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
        event = wh.verify(payload, headers)
    except WebhookVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc

    event_type = event["type"]
    data = event["data"]
    request_id = getattr(request.state, "request_id", "-")
    logger.info("Clerk webhook %s", event_type, extra={"request_id": request_id})

    if event_type in {"user.created", "user.updated"}:
        upsert_user_from_clerk_data(db, data)
    elif event_type == "user.deleted":
        clerk_id = data.get("id")
        if clerk_id:
            try:
                delete_user(db, clerk_id)
            except HTTPException as exc:
                if exc.status_code != 404:
                    raise

    return {"status": "ok"}
