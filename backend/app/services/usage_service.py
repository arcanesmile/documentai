from typing import Optional
from google.cloud.firestore import AsyncClient, Increment
from ..core.database import Database


class UsageService:
    _instance: Optional["UsageService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def check_upload_limit(self, user_id: str) -> bool:
        db = Database.get_db()
        doc = await db.collection("users").document(user_id).get()
        if not doc.exists:
            return True
        user = doc.to_dict()
        sub = user.get("subscription", {})
        usage = sub.get("usage", {})
        limit = usage.get("documentsLimit", 10)
        current = usage.get("documentsUploaded", 0)
        return current < limit

    async def check_search_limit(self, user_id: str) -> bool:
        db = Database.get_db()
        doc = await db.collection("users").document(user_id).get()
        if not doc.exists:
            return True
        user = doc.to_dict()
        sub = user.get("subscription", {})
        usage = sub.get("usage", {})
        limit = usage.get("searchesLimit", 50)
        current = usage.get("searchesPerformed", 0)
        return current < limit

    async def increment_upload_count(self, user_id: str, file_size: int = 0):
        db = Database.get_db()
        ref = db.collection("users").document(user_id)
        await ref.update({
            "subscription.usage.documentsUploaded": Increment(1),
            "subscription.usage.storageUsed": Increment(file_size),
        })

    async def decrement_upload_count(self, user_id: str, file_size: int = 0):
        db = Database.get_db()
        ref = db.collection("users").document(user_id)
        await ref.update({
            "subscription.usage.documentsUploaded": Increment(-1),
            "subscription.usage.storageUsed": Increment(-file_size),
        })

    async def increment_search_count(self, user_id: str):
        db = Database.get_db()
        ref = db.collection("users").document(user_id)
        await ref.update({
            "subscription.usage.searchesPerformed": Increment(1),
        })

    async def get_usage(self, user_id: str) -> dict:
        db = Database.get_db()
        doc = await db.collection("users").document(user_id).get()
        if not doc.exists:
            return {}
        return doc.to_dict().get("subscription", {}).get("usage", {})


usage_service = UsageService()
