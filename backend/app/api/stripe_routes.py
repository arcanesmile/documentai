from fastapi import APIRouter, Depends, HTTPException, Request
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..api.deps import get_current_user
from ..core.config import settings
import stripe
import json

router = APIRouter(prefix="/api/stripe", tags=["Stripe"])

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout-session")
async def create_checkout_session(
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    email = current_user.get("email", "")

    try:
        session = stripe.checkout.Session.create(
            customer_email=email,
            client_reference_id=user_id,
            mode="subscription",
            line_items=[{"price": settings.STRIPE_PRO_PRICE_ID, "quantity": 1}],
            success_url="http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/pricing",
            metadata={"userId": user_id},
        )
        return {"url": session.url, "sessionId": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    user_doc = await db.collection("users").document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    customer_id = user_doc.to_dict().get("subscription", {}).get("stripeCustomerId")
    if not customer_id:
        raise HTTPException(status_code=400, detail="No active subscription")

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="http://localhost:3000/dashboard/settings",
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncClient = Depends(get_database)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("userId")
        if user_id:
            customer_id = session.get("customer")
            subscription_id = session.get("subscription")
            await db.collection("users").document(user_id).update({
                "subscription.plan": "pro",
                "subscription.status": "active",
                "subscription.stripeCustomerId": customer_id,
                "subscription.stripeSubscriptionId": subscription_id,
                "subscription.currentPeriodStart": session.get("current_period_start"),
                "subscription.currentPeriodEnd": session.get("current_period_end"),
                "subscription.usage.documentsLimit": 100,
                "subscription.usage.searchesLimit": 1000,
                "subscription.usage.storageLimit": 500 * 1024 * 1024,
            })

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        users = await db.collection("users").where("subscription.stripeCustomerId", "==", customer_id).limit(1).get()
        for u in users:
            status = subscription.get("status")
            plan = "pro" if status == "active" else "free"
            await db.collection("users").document(u.id).update({
                "subscription.plan": plan,
                "subscription.status": status,
            })

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        users = await db.collection("users").where("subscription.stripeCustomerId", "==", customer_id).limit(1).get()
        for u in users:
            await db.collection("users").document(u.id).update({
                "subscription.plan": "free",
                "subscription.status": "canceled",
                "subscription.usage.documentsLimit": 10,
                "subscription.usage.searchesLimit": 50,
                "subscription.usage.storageLimit": 50 * 1024 * 1024,
            })

    return {"received": True}
