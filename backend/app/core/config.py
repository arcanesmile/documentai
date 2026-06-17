from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "realAI API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    GOOGLE_APPLICATION_CREDENTIALS: str = "serviceAccountKey.json"
    FIREBASE_PROJECT_ID: str = "trade-257e7"
    FIREBASE_STORAGE_BUCKET: str = "trade-257e7.appspot.com"

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRO_PRICE_ID: str = ""

    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "groq"
    HUGGINGFACE_API_KEY: str = ""
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    LLM_MODEL: str = "llama-3.3-70b-versatile"

    MAX_CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    UPLOAD_DIR: str = "./uploads"
    FAISS_INDEX_PATH: str = "./faiss_index"

    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        if self.DEBUG:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
