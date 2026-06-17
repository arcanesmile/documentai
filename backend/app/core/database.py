from google.cloud.firestore import AsyncClient
from .firebase import firebase_service


class Database:
    _db: AsyncClient = None

    @classmethod
    async def connect(cls):
        firebase_service.initialize()
        cls._db = await firebase_service.get_db()
        print("Firestore connected")

    @classmethod
    async def disconnect(cls):
        if cls._db:
            cls._db.close()

    @classmethod
    def get_db(cls) -> AsyncClient:
        return cls._db


async def get_database() -> AsyncClient:
    return Database.get_db()
