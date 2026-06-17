from fastapi import APIRouter, HTTPException, Depends, status
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..api.deps import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user.get("name", ""),
        "email": current_user.get("email", ""),
        "image": current_user.get("image"),
        "role": current_user.get("role", "user"),
        "subscription": current_user.get("subscription", {}),
        "createdAt": current_user.get("createdAt"),
        "updatedAt": current_user.get("updatedAt"),
    }
