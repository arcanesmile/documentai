import firebase_admin
import os
import json
from firebase_admin import credentials, auth, storage
from google.cloud.firestore import AsyncClient
from google.oauth2 import service_account
from .config import settings


class FirebaseService:
    _initialized = False
    _db: AsyncClient = None
    _bucket = None
    _credentials = None

    @classmethod
    def initialize(cls):
        if cls._initialized:
            return
        cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
        abs_path = os.path.abspath(cred_path)

        with open(abs_path) as f:
            cls._credentials = json.load(f)

        cred = credentials.Certificate(abs_path)
        firebase_admin.initialize_app(cred, {
            "storageBucket": settings.FIREBASE_STORAGE_BUCKET,
            "projectId": settings.FIREBASE_PROJECT_ID,
        })
        cls._bucket = storage.bucket()
        cls._initialized = True
        print(f"Firebase Admin initialized: {settings.FIREBASE_PROJECT_ID}")

    @classmethod
    async def get_db(cls) -> AsyncClient:
        if not cls._initialized:
            cls.initialize()
        if cls._db is None:
            sa_creds = service_account.Credentials.from_service_account_info(
                cls._credentials,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )
            cls._db = AsyncClient(
                project=settings.FIREBASE_PROJECT_ID,
                credentials=sa_creds,
            )
        return cls._db

    @classmethod
    def get_bucket(cls):
        if not cls._initialized:
            cls.initialize()
        return cls._bucket

    @classmethod
    def verify_token(cls, id_token: str) -> dict:
        try:
            decoded = auth.verify_id_token(id_token)
            return decoded
        except Exception as e:
            print(f"Firebase token verification failed: {e}")
            return None


firebase_service = FirebaseService()
