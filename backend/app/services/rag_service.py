import os
import pickle
import numpy as np
from typing import List, Optional, Tuple
from langchain_text_splitters import RecursiveCharacterTextSplitter
import faiss
from .embedding_service import embedding_service
from ..core.config import settings


class RAGService:
    _instance: Optional["RAGService"] = None
    _index: Optional[faiss.IndexFlatIP] = None
    _chunk_store: List[dict] = []
    _dimension: int = 384

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self, db=None):
        await embedding_service.initialize()
        os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
        await self._load_index()
        if self._index is not None and self._dimension != embedding_service._dimension:
            print(f"Dimension mismatch: index={self._dimension}, embeddings={embedding_service._dimension}, recreating index")
            self._create_new_index()
            if db is not None:
                await self._rebuild_from_firestore(db)
        if db is not None and (self._index is None or self._index.ntotal == 0):
            await self._rebuild_from_firestore(db)
        print(f"RAG service initialized with dimension {self._dimension}, {self._index.ntotal if self._index else 0} vectors")

    async def _load_index(self):
        index_file = os.path.join(settings.FAISS_INDEX_PATH, "index.faiss")
        store_file = os.path.join(settings.FAISS_INDEX_PATH, "chunks.pkl")

        if os.path.exists(index_file) and os.path.exists(store_file):
            try:
                self._index = faiss.read_index(index_file)
                with open(store_file, "rb") as f:
                    self._chunk_store = pickle.load(f)
                self._dimension = self._index.d
                print(f"Loaded FAISS index with {self._index.ntotal} vectors")
            except Exception as e:
                print(f"Failed to load index: {e}, creating new one")
                self._create_new_index()

    def _create_new_index(self):
        self._dimension = embedding_service._dimension
        self._index = faiss.IndexFlatIP(self._dimension)
        self._chunk_store = []

    async def _save_index(self):
        index_file = os.path.join(settings.FAISS_INDEX_PATH, "index.faiss")
        store_file = os.path.join(settings.FAISS_INDEX_PATH, "chunks.pkl")
        faiss.write_index(self._index, index_file)
        with open(store_file, "wb") as f:
            pickle.dump(self._chunk_store, f)

    async def _rebuild_from_firestore(self, db):
        print("Rebuilding FAISS index from Firestore...")
        docs = await db.collection("documents").get()
        self._create_new_index()
        total_chunks = 0
        for doc_snapshot in docs:
            data = doc_snapshot.to_dict()
            text = data.get("rawText") or data.get("text")
            doc_id = doc_snapshot.id
            if not text:
                continue
            chunks = self.chunk_text(text)
            if not chunks:
                continue
            embeddings = await embedding_service.embed_batch(chunks)
            embeddings_array = np.array(embeddings).astype(np.float32)
            self._index.add(embeddings_array)
            for i, chunk in enumerate(chunks):
                self._chunk_store.append({
                    "id": f"{doc_id}_chunk_{i}",
                    "documentId": doc_id,
                    "documentName": data.get("originalName", "unknown"),
                    "userId": data.get("userId", ""),
                    "content": chunk,
                    "chunkIndex": i,
                })
            total_chunks += len(chunks)
        if total_chunks > 0:
            await self._save_index()
            print(f"Rebuilt index with {total_chunks} chunks from {len(docs)} documents")

    def chunk_text(self, text: str) -> List[str]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.MAX_CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
            length_function=len,
        )
        return splitter.split_text(text)

    async def index_document(
        self, document_id: str, document_name: str, text: str, user_id: str = ""
    ) -> Tuple[int, List[str]]:
        chunks = self.chunk_text(text)
        if not chunks:
            return 0, []

        embeddings = await embedding_service.embed_batch(chunks)

        if self._index is None:
            self._create_new_index()

        embeddings_array = np.array(embeddings).astype(np.float32)
        self._index.add(embeddings_array)

        for i, chunk in enumerate(chunks):
            self._chunk_store.append({
                "id": f"{document_id}_chunk_{i}",
                "documentId": document_id,
                "documentName": document_name,
                "userId": user_id,
                "content": chunk,
                "chunkIndex": i,
            })

        await self._save_index()
        return len(chunks), chunks

    async def search(
        self, query: str, top_k: int = 5, document_ids: Optional[List[str]] = None,
        user_id: Optional[str] = None,
    ) -> List[dict]:
        if self._index is None or self._index.ntotal == 0:
            return []

        query_embedding = await embedding_service.embed_text(query)
        query_array = np.array([query_embedding]).astype(np.float32)

        k = min(top_k * 3, self._index.ntotal)
        scores, indices = self._index.search(query_array, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self._chunk_store):
                continue
            chunk = self._chunk_store[idx]
            if user_id and chunk.get("userId") and chunk["userId"] != user_id:
                continue
            if document_ids and chunk["documentId"] not in document_ids:
                continue
            results.append({
                "id": chunk["id"],
                "content": chunk["content"],
                "documentId": chunk["documentId"],
                "documentName": chunk["documentName"],
                "similarity": float(score),
                "chunkIndex": chunk["chunkIndex"],
            })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    async def get_context_for_query(
        self, query: str, top_k: int = 5, document_ids: Optional[List[str]] = None,
        user_id: Optional[str] = None
    ) -> Tuple[str, List[dict]]:
        results = await self.search(query, top_k, document_ids, user_id=user_id)

        if not results:
            return "No relevant documents found.", []

        context_parts = []
        for r in results:
            context_parts.append(
                f"[Source: {r['documentName']} (Relevance: {r['similarity']:.2f})]\n{r['content']}"
            )

        context = "\n\n---\n\n".join(context_parts)
        return context, results

    async def delete_document_chunks(self, document_id: str):
        indices_to_keep = [
            i for i, chunk in enumerate(self._chunk_store)
            if chunk["documentId"] != document_id
        ]

        if len(indices_to_keep) == len(self._chunk_store):
            return

        if len(indices_to_keep) == 0:
            self._create_new_index()
            await self._save_index()
            return

        new_chunks = [self._chunk_store[i] for i in indices_to_keep]
        texts = [c["content"] for c in new_chunks]
        embeddings = await embedding_service.embed_batch(texts)

        self._create_new_index()
        embeddings_array = np.array(embeddings).astype(np.float32)
        self._index.add(embeddings_array)
        self._chunk_store = new_chunks

        await self._save_index()


rag_service = RAGService()
