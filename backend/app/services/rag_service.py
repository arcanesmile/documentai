import asyncio
import json
import logging
import os
import pickle
from typing import List, Optional, Tuple

import faiss
import numpy as np
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ..core.config import settings
from .embedding_service import embedding_service

logger = logging.getLogger(__name__)

# Bump when chunking/embedding semantics change so stored indexes get rebuilt.
INDEX_VERSION = 2


class RAGService:
    """FAISS-backed chunk index. Vectors are L2-normalized; scores are cosine similarity."""

    def __init__(self):
        self._index: Optional[faiss.IndexFlatIP] = None
        self._chunk_store: List[dict] = []
        self._lock = asyncio.Lock()
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.MAX_CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""],
        )

    # ---------- paths / persistence ----------
    @property
    def _index_file(self):
        return os.path.join(settings.FAISS_INDEX_PATH, "index.faiss")

    @property
    def _store_file(self):
        return os.path.join(settings.FAISS_INDEX_PATH, "chunks.pkl")

    @property
    def _meta_file(self):
        return os.path.join(settings.FAISS_INDEX_PATH, "meta.json")

    def _expected_meta(self) -> dict:
        return {
            "version": INDEX_VERSION,
            "backend": embedding_service.backend,
            "dimension": embedding_service.dimension,
        }

    def _load_index(self) -> bool:
        """Load index from disk. Returns False if missing or incompatible."""
        if not all(os.path.exists(p) for p in (self._index_file, self._store_file, self._meta_file)):
            return False
        try:
            with open(self._meta_file, "r", encoding="utf-8") as f:
                meta = json.load(f)
            if meta != self._expected_meta():
                logger.info("Index metadata %s != expected %s; rebuilding", meta, self._expected_meta())
                return False
            index = faiss.read_index(self._index_file)
            with open(self._store_file, "rb") as f:
                store = pickle.load(f)  # local, app-written file only
            if index.ntotal != len(store):
                logger.warning("Index/store size mismatch; rebuilding")
                return False
            self._index, self._chunk_store = index, store
            logger.info("Loaded FAISS index with %d vectors", index.ntotal)
            return True
        except Exception as e:
            logger.warning("Failed to load index: %r", e)
            return False

    def _save_index(self):
        # write to temp files then atomically replace, so a crash can't corrupt the index
        tmp_index, tmp_store, tmp_meta = (p + ".tmp" for p in (self._index_file, self._store_file, self._meta_file))
        faiss.write_index(self._index, tmp_index)
        with open(tmp_store, "wb") as f:
            pickle.dump(self._chunk_store, f)
        with open(tmp_meta, "w", encoding="utf-8") as f:
            json.dump(self._expected_meta(), f)
        os.replace(tmp_index, self._index_file)
        os.replace(tmp_store, self._store_file)
        os.replace(tmp_meta, self._meta_file)

    def _create_new_index(self):
        self._index = faiss.IndexFlatIP(embedding_service.dimension)
        self._chunk_store = []

    # ---------- lifecycle ----------
    async def initialize(self, db=None):
        await embedding_service.initialize()
        os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
        async with self._lock:
            if not self._load_index():
                self._create_new_index()
                if db is not None:
                    await self._rebuild_from_firestore(db)
        logger.info("RAG ready: backend=%s dim=%d vectors=%d",
                    embedding_service.backend, embedding_service.dimension, self._index.ntotal)

    async def _rebuild_from_firestore(self, db):
        logger.info("Rebuilding FAISS index from Firestore...")
        self._create_new_index()
        docs = await db.collection("documents").get()
        for snap in docs:
            data = snap.to_dict()
            text = data.get("rawText") or data.get("text")
            if text:
                await self._add_chunks(snap.id, data.get("originalName", "unknown"), text, data.get("userId", ""))
        self._save_index()
        logger.info("Rebuilt index: %d chunks from %d documents", self._index.ntotal, len(docs))

    # ---------- indexing ----------
    def chunk_text(self, text: str) -> List[str]:
        return [c for c in self._splitter.split_text(text or "") if c.strip()]

    async def _add_chunks(self, document_id: str, document_name: str, text: str, user_id: str) -> List[str]:
        chunks = self.chunk_text(text)
        if not chunks:
            return []
        vectors = await embedding_service.embed_documents(chunks)
        self._index.add(vectors)
        self._chunk_store.extend(
            {
                "id": f"{document_id}_chunk_{i}",
                "documentId": document_id,
                "documentName": document_name,
                "userId": user_id,
                "content": chunk,
                "chunkIndex": i,
            }
            for i, chunk in enumerate(chunks)
        )
        return chunks

    async def index_document(
        self, document_id: str, document_name: str, text: str, user_id: str
    ) -> Tuple[int, List[str]]:
        async with self._lock:
            chunks = await self._add_chunks(document_id, document_name, text, user_id)
            if chunks:
                self._save_index()
        return len(chunks), chunks

    async def delete_document_chunks(self, document_id: str):
        async with self._lock:
            keep = [i for i, c in enumerate(self._chunk_store) if c["documentId"] != document_id]
            if len(keep) == len(self._chunk_store):
                return
            # Reuse stored vectors instead of re-embedding every remaining chunk.
            vectors = self._index.reconstruct_n(0, self._index.ntotal)[keep] if keep else None
            new_store = [self._chunk_store[i] for i in keep]
            self._create_new_index()
            if vectors is not None:
                self._index.add(np.ascontiguousarray(vectors, dtype=np.float32))
            self._chunk_store = new_store
            self._save_index()

    # ---------- retrieval ----------
    async def search(
        self,
        query: str,
        user_id: str,
        top_k: int = 5,
        document_ids: Optional[List[str]] = None,
        min_score: float = 0.0,
    ) -> List[dict]:
        if self._index is None or self._index.ntotal == 0:
            return []

        allowed_docs = set(document_ids) if document_ids else None
        query_vec = await embedding_service.embed_query(query)

        # The index is shared by all users, so over-fetch generously before filtering.
        k = min(max(top_k * 20, 200), self._index.ntotal)
        scores, indices = self._index.search(query_vec, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            chunk = self._chunk_store[idx]
            # Strict ownership check: chunks without an owner are never returned.
            if chunk.get("userId") != user_id:
                continue
            if allowed_docs is not None and chunk["documentId"] not in allowed_docs:
                continue
            if score < min_score:
                continue
            results.append({
                "id": chunk["id"],
                "content": chunk["content"],
                "documentId": chunk["documentId"],
                "documentName": chunk["documentName"],
                "similarity": float(score),
                "chunkIndex": chunk["chunkIndex"],
            })
            if len(results) >= top_k:
                break
        return results  # FAISS already returns results sorted by score

    @staticmethod
    def build_context(results: List[dict]) -> str:
        if not results:
            return ""
        return "\n\n---\n\n".join(
            f"[Source {n}: {r['documentName']} (chunk {r['chunkIndex']})]\n{r['content']}"
            for n, r in enumerate(results, 1)
        )

    async def get_context_for_query(
        self, query: str, user_id: str, top_k: int = 5, document_ids: Optional[List[str]] = None
    ) -> Tuple[str, List[dict]]:
        results = await self.search(query, user_id=user_id, top_k=top_k, document_ids=document_ids)
        return self.build_context(results), results


rag_service = RAGService()
