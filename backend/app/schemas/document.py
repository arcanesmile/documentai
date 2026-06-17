from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DocumentCreate(BaseModel):
    filename: str
    originalName: str
    fileType: str
    fileSize: int


class DocumentResponse(BaseModel):
    id: str
    userId: str
    filename: str
    originalName: str
    fileType: str
    fileSize: int
    chunks: int
    indexed: bool
    createdAt: datetime
    updatedAt: datetime


class DocumentList(BaseModel):
    documents: list[DocumentResponse]
    total: int
