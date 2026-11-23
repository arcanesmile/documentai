import asyncio
import hashlib
import logging
from typing import List, Optional

import numpy as np

from ..core.config import settings

logger = logging.getLogger(__name__)

GEMINI_EMBED_MODEL = "gemini-embedding-001"
GEMINI_BATCH_SIZE = 100  # API limit per embed_content request


def _normalize(vec: np.ndarray) -> np.ndarray:
    """L2-normalize so inner product == cosine similarity (FAISS IndexFlatIP)."""
    norms = np.linalg.norm(vec, axis=-1, keepdims=True)
    norms[norms == 0] = 1.0
    return vec / norms


class EmbeddingService:
    """Embeddings via local SentenceTransformer, Gemini, or a deterministic mock."""

    def __init__(self):
        self._model = None
        self._gemini_client = None
        self._initialized = False
        self.backend = "mock"
        self._dimension = 384

    @property
    def dimension(self) -> int:
        return self._dimension

    async def initialize(self):
        if self._initialized:
            return
        self._initialized = True

        if settings.USE_LOCAL_EMBEDDINGS and await self._init_local():
            return
        if settings.GEMINI_API_KEY and await self._init_gemini():
            return

        logger.warning("Using mock embeddings (dim=%d) - search relevance will be poor", self._dimension)
        self.backend = "mock"

    async def _init_local(self) -> bool:
        model_name = settings.EMBEDDING_MODEL

        def _load(local_only: bool):
            from sentence_transformers import SentenceTransformer
            return SentenceTransformer(model_name, local_files_only=local_only)

        for local_only in (True, False):
            try:
                logger.info("Loading embedding model %s (local_only=%s)", model_name, local_only)
                self._model = await asyncio.wait_for(asyncio.to_thread(_load, local_only), timeout=120)
                self._dimension = self._model.get_sentence_embedding_dimension()
                self.backend = "local"
                logger.info("Local embedding model loaded (dim=%d)", self._dimension)
                return True
            except Exception as e:  # includes TimeoutError
                logger.warning("Local embedding load failed (local_only=%s): %r", local_only, e)
        return False

    async def _init_gemini(self) -> bool:
        try:
            from google import genai

            self._gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            test = await self._gemini_embed(["test"], "RETRIEVAL_QUERY")
            self._dimension = len(test[0])
            self.backend = "gemini"
            logger.info("Gemini embeddings ready (dim=%d)", self._dimension)
            return True
        except Exception as e:
            logger.warning("Gemini embeddings unavailable: %r", e)
            return False

    async def _gemini_embed(self, texts: List[str], task_type: str) -> List[List[float]]:
        from google.genai import types

        out: List[List[float]] = []
        for i in range(0, len(texts), GEMINI_BATCH_SIZE):
            batch = texts[i : i + GEMINI_BATCH_SIZE]
            result = await asyncio.to_thread(
                self._gemini_client.models.embed_content,
                model=GEMINI_EMBED_MODEL,
                contents=batch,
                config=types.EmbedContentConfig(task_type=task_type),
            )
            out.extend(e.values for e in result.embeddings)
        return out

    def _mock_embed(self, text: str) -> List[float]:
        # hashlib (not hash()) so vectors are stable across process restarts
        seed = int.from_bytes(hashlib.sha256(text.encode("utf-8")).digest()[:4], "little")
        return np.random.RandomState(seed).randn(self._dimension).tolist()

    async def _embed(self, texts: List[str], task_type: str) -> np.ndarray:
        if not texts:
            return np.zeros((0, self._dimension), dtype=np.float32)
        if self.backend == "gemini":
            vectors = await self._gemini_embed(texts, task_type)
        elif self.backend == "local":
            vectors = await asyncio.to_thread(
                self._model.encode, texts, normalize_embeddings=True, show_progress_bar=False
            )
        else:
            vectors = [self._mock_embed(t) for t in texts]
        return _normalize(np.asarray(vectors, dtype=np.float32))

    async def embed_query(self, text: str) -> np.ndarray:
        """Returns a (1, dim) float32 normalized array."""
        return await self._embed([text], "RETRIEVAL_QUERY")

    async def embed_documents(self, texts: List[str]) -> np.ndarray:
        """Returns an (n, dim) float32 normalized array."""
        return await self._embed(texts, "RETRIEVAL_DOCUMENT")


embedding_service = EmbeddingService()
