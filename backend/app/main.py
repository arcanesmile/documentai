import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .core.config import settings
from .core.database import Database
from .services.embedding_service import embedding_service
from .services.rag_service import rag_service
from .services.llm_service import llm_service
from .api.auth import router as auth_router
from .api.documents import router as documents_router
from .api.search import router as search_router
from .api.chat import router as chat_router
from .api.stripe_routes import router as stripe_router
from .api.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)

    await Database.connect()

    db = Database.get_db()
    services = [
        ("Embedding", embedding_service.initialize()),
        ("RAG", rag_service.initialize(db=db)),
        ("LLM", llm_service.initialize()),
    ]
    for name, coro in services:
        try:
            await coro
        except Exception as e:
            print(f"Warning: {name} service initialization failed: {e}")

    print("Application startup complete")
    yield

    await Database.disconnect()
    print("Application shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Semantic Search Engine API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=not settings.DEBUG,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(search_router)
app.include_router(chat_router)
app.include_router(stripe_router)
app.include_router(admin_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if Database._db is not None else "disconnected",
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
