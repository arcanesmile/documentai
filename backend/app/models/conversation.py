from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class Source(BaseModel):
    documentId: str
    documentName: str
    content: str
    similarity: float
    chunkIndex: int


class Message(BaseModel):
    id: str
    role: str
    content: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    sources: Optional[List[Source]] = None


class ConversationModel(BaseModel):
    userId: str
    title: str = "New Chat"
    messages: List[Message] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
