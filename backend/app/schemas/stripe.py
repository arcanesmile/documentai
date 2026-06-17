from pydantic import BaseModel
from typing import Optional


class StripeCheckoutResponse(BaseModel):
    url: str


class StripePortalResponse(BaseModel):
    url: str


class StripeWebhookResponse(BaseModel):
    received: bool
