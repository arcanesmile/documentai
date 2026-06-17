from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MessageContent(BaseModel):
    id: str
    role: str
    content: str
    createdAt: datetime
    sources: Optional[List[dict]] = None


class ConversationCreate(BaseModel):
    title: str = "New Chat"


class ConversationResponse(BaseModel):
    id: str
    userId: str
    title: str
    messages: List[MessageContent]
    createdAt: datetime
    updatedAt: datetime


class ConversationList(BaseModel):
    conversations: List[ConversationResponse]
    total: int
