from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Usage(BaseModel):
    documentsUploaded: int = 0
    searchesPerformed: int = 0
    storageUsed: int = 0
    documentsLimit: int = 10
    searchesLimit: int = 50
    storageLimit: int = 50 * 1024 * 1024


class Subscription(BaseModel):
    plan: str = "free"
    status: str = "active"
    stripeCustomerId: Optional[str] = None
    stripeSubscriptionId: Optional[str] = None
    currentPeriodStart: Optional[datetime] = None
    currentPeriodEnd: Optional[datetime] = None
    usage: Usage = Usage()
