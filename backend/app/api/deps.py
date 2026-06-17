from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..core.security import verify_firebase_token
from ..core.config import settings

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncClient = Depends(get_database),
):
    if not credentials:
        if settings.DEBUG:
            users = await db.collection("users").limit(1).get()
            for u in users:
                doc = u.to_dict()
                doc["id"] = u.id
                return doc
            return {
                "id": "demo",
                "name": "Demo User",
                "email": "demo@example.com",
                "role": "user",
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )

    token = credentials.credentials
    decoded = verify_firebase_token(token)
    if decoded:
        uid = decoded.get("uid")
        email = decoded.get("email", "")
        user_doc = await db.collection("users").document(uid).get()
        if user_doc.exists:
            user = user_doc.to_dict()
            user["id"] = user_doc.id
            return user
        user = {
            "id": uid,
            "name": decoded.get("name", ""),
            "email": email,
            "image": decoded.get("picture"),
            "role": "user",
            "subscription": {
                "plan": "free",
                "status": "active",
                "usage": {
                    "documentsUploaded": 0,
                    "searchesPerformed": 0,
                    "storageUsed": 0,
                    "documentsLimit": 10,
                    "searchesLimit": 50,
                    "storageLimit": 50 * 1024 * 1024,
                },
            },
        }
        await db.collection("users").document(uid).set(user)
        user["id"] = uid
        return user

    if settings.DEBUG:
        users = await db.collection("users").limit(1).get()
        for u in users:
            doc = u.to_dict()
            doc["id"] = u.id
            return doc
        return {
            "id": token,
            "name": "Demo User",
            "email": "demo@example.com",
            "role": "user",
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
    )


async def get_current_admin(
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
