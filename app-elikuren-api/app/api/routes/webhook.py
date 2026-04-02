from fastapi import APIRouter, Request, HTTPException, Depends
from svix.webhooks import Webhook, WebhookVerificationError
from app.services.user_service import upsert_user_from_clerk_data, update_user
from app.api.deps import get_db
from sqlmodel import Session

from app.core.config import settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    headers = request.headers

    try:
        wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
        event = wh.verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event["type"]
    data = event["data"]

    print("Webhook event:", event_type)

    if event_type == "user.created":
        print(data)
        upsert_user_from_clerk_data(db, data)

    elif event_type == "user.updated":
        print("Update user:", data["id"])
        update_user(db, data)

    elif event_type == "user.deleted":
        print("Delete user:", data["id"])

    return {"status": "ok"}