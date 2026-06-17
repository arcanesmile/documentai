from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    image: Optional[str] = None
    role: str
    subscription: dict
    createdAt: datetime
    updatedAt: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UsageResponse(BaseModel):
    documentsUploaded: int
    searchesPerformed: int
    storageUsed: int
    documentsLimit: int
    searchesLimit: int
    storageLimit: int


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    usage: UsageResponse
    currentPeriodEnd: Optional[datetime] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
