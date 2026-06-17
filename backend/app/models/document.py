from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DocumentModel(BaseModel):
    userId: str
    filename: str
    originalName: str
    fileType: str
    fileSize: int
    filePath: str
    chunks: int = 0
    indexed: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
