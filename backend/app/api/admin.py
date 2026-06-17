from fastapi import APIRouter, Depends, HTTPException
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..api.deps import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
async def admin_stats(
    current_user: dict = Depends(get_current_admin),
    db: AsyncClient = Depends(get_database),
):
    users = await db.collection("users").count().get()
    docs = await db.collection("documents").count().get()
    convs = await db.collection("conversations").count().get()

    return {
        "totalUsers": users[0][0].value if users else 0,
        "totalDocuments": docs[0][0].value if docs else 0,
        "totalConversations": convs[0][0].value if convs else 0,
        "systemHealth": "healthy",
    }


@router.get("/users")
async def admin_users(
    current_user: dict = Depends(get_current_admin),
    db: AsyncClient = Depends(get_database),
):
    users = await db.collection("users").limit(100).get()
    return [
        {
            "id": u.id,
            "name": u.to_dict().get("name", ""),
            "email": u.to_dict().get("email", ""),
            "role": u.to_dict().get("role", "user"),
            "subscription": u.to_dict().get("subscription", {}),
            "createdAt": u.to_dict().get("createdAt"),
        }
        for u in users
    ]
