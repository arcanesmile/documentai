import stripe
from typing import Optional, Dict
from datetime import datetime
from ..core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    async def create_checkout_session(self, user_id: str, user_email: str) -> Optional[str]:
        try:
            session = stripe.checkout.Session.create(
                customer_email=user_email,
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": settings.STRIPE_PRO_PRICE_ID,
                        "quantity": 1,
                    }
                ],
                mode="subscription",
                success_url=f"{settings.CORS_ORIGINS.split(',')[0].strip()}/dashboard/settings?success=true",
                cancel_url=f"{settings.CORS_ORIGINS.split(',')[0].strip()}/dashboard/settings?canceled=true",
                metadata={"userId": user_id},
                subscription_data={
                    "metadata": {"userId": user_id},
                },
            )
            return session.url
        except Exception as e:
            print(f"Stripe checkout error: {e}")
            return None

    async def create_portal_session(self, customer_id: str) -> Optional[str]:
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=f"{settings.CORS_ORIGINS.split(',')[0].strip()}/dashboard/settings",
            )
            return session.url
        except Exception as e:
            print(f"Stripe portal error: {e}")
            return None

    async def handle_webhook(self, payload: bytes, sig_header: str) -> Optional[Dict]:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )

            event_data = {
                "type": event["type"],
                "data": event["data"]["object"],
            }

            # Handle subscription events
            if event["type"] == "checkout.session.completed":
                session = event["data"]["object"]
                subscription_id = session.get("subscription")
                customer_id = session.get("customer")
                user_id = session.get("metadata", {}).get("userId")

                if subscription_id and user_id:
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    event_data["user_id"] = user_id
                    event_data["subscription_id"] = subscription_id
                    event_data["customer_id"] = customer_id
                    event_data["current_period_start"] = datetime.fromtimestamp(
                        subscription.current_period_start
                    )
                    event_data["current_period_end"] = datetime.fromtimestamp(
                        subscription.current_period_end
                    )

            elif event["type"] == "customer.subscription.updated":
                subscription = event["data"]["object"]
                user_id = subscription.get("metadata", {}).get("userId")
                event_data["user_id"] = user_id
                event_data["status"] = subscription["status"]

            elif event["type"] == "customer.subscription.deleted":
                subscription = event["data"]["object"]
                user_id = subscription.get("metadata", {}).get("userId")
                event_data["user_id"] = user_id
                event_data["status"] = "canceled"

            return event_data

        except stripe.error.SignatureVerificationError:
            print("Invalid stripe signature")
            return None
        except Exception as e:
            print(f"Webhook error: {e}")
            return None


stripe_service = StripeService()
