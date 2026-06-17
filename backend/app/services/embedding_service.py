import numpy as np
import asyncio
from typing import List, Optional
from ..core.config import settings


class EmbeddingService:
    _instance: Optional["EmbeddingService"] = None
    _model = None
    _initialized: bool = False
    _using_mock: bool = False
    _using_gemini: bool = False
    _dimension: int = 384
    _gemini_client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self):
        if self._initialized:
            return
        self._initialized = True

        loop = asyncio.get_event_loop()
        model_name = settings.EMBEDDING_MODEL

        def _try_load(local_only: bool):
            from sentence_transformers import SentenceTransformer
            return SentenceTransformer(model_name, local_files_only=local_only)

        for attempt, local_only in enumerate(["local", "download"]):
            try:
                print(f"Loading embedding model: {model_name} ({'local only' if local_only else 'download'})")
                self._model = await asyncio.wait_for(
                    loop.run_in_executor(None, lambda lo=local_only: _try_load(lo)),
                    timeout=25,
                )
                self._dimension = self._model.get_sentence_embedding_dimension()
                print(f"Embedding model loaded (dim={self._dimension})")
                return
            except asyncio.TimeoutError:
                print(f"Embedding model loading timed out ({local_only})")
            except Exception as e:
                print(f"Embedding model not available ({local_only}): {e}")

        print("Trying Gemini embeddings...")
        try:
            from google import genai as genai_client
            self._gemini_client = genai_client.Client(api_key=settings.GEMINI_API_KEY)
            test = await loop.run_in_executor(
                None,
                lambda: self._gemini_client.models.embed_content(
                    model="models/gemini-embedding-001",
                    contents="test",
                ),
            )
            self._dimension = len(test.embeddings[0].values)
            self._using_gemini = True
            print(f"Gemini embeddings loaded (dim={self._dimension})")
            return
        except Exception as e:
            print(f"Gemini embeddings not available: {e}")

        print(f"Using mock embeddings (dim={self._dimension}) - search relevance will be poor")
        self._model = None
        self._using_mock = True

    async def embed_text(self, text: str) -> List[float]:
        if self._using_gemini:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self._gemini_client.models.embed_content(
                    model="models/gemini-embedding-001",
                    contents=text,
                ),
            )
            return result.embeddings[0].values
        if self._using_mock:
            rng = np.random.RandomState(hash(text) % (2**31))
            return rng.randn(self._dimension).tolist()
        embedding = self._model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if self._using_gemini:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self._gemini_client.models.embed_content(
                    model="models/gemini-embedding-001",
                    contents=texts,
                ),
            )
            return [e.values for e in result.embeddings]
        if self._using_mock:
            return [await self.embed_text(t) for t in texts]
        embeddings = self._model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return [emb.tolist() for emb in embeddings]

    async def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        return float(np.dot(embedding1, embedding2))


embedding_service = EmbeddingService()
