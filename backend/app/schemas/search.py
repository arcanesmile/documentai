from pydantic import BaseModel, Field
from typing import Optional, List


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    documentIds: Optional[List[str]] = None
    top_k: int = Field(default=6, ge=1, le=20)
    analyze: bool = True


class SearchResult(BaseModel):
    id: str
    content: str
    documentId: str
    documentName: str
    similarity: float
    chunkIndex: int


class SearchResponse(BaseModel):
    answer: Optional[str] = None
    answerError: Optional[str] = None
    provider: Optional[str] = None
    results: List[SearchResult]
    total: int


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversationId: Optional[str] = None
    documentIds: Optional[List[str]] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[SearchResult]
    conversationId: str
