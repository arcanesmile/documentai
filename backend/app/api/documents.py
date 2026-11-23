from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..api.deps import get_current_user
from ..services.usage_service import usage_service
from ..services.rag_service import rag_service
from ..core.firebase import firebase_service
from ..core.config import settings
from ..services.file_service import file_service
import asyncio
import datetime
import logging
import os
import uuid
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents"])


async def upload_to_supabase(storage_path: str, content: bytes, content_type: str) -> str:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return ""
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{settings.SUPABASE_BUCKET}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": content_type or "application/octet-stream",
        "x-upsert": "false",
    }
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(url, content=content, headers=headers)
    response.raise_for_status()
    return f"supabase:{storage_path}"


async def delete_from_supabase(storage_path: str) -> None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/remove/{settings.SUPABASE_BUCKET}"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json={"prefixes": [storage_path]}, headers=headers)
    response.raise_for_status()


@router.get("")
async def list_documents(
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    docs = await db.collection("documents").where("userId", "==", user_id).get()
    result = [
        {
            "id": d.id,
            "userId": d.to_dict().get("userId"),
            "filename": d.to_dict().get("filename"),
            "originalName": d.to_dict().get("originalName"),
            "fileType": d.to_dict().get("fileType"),
            "fileSize": d.to_dict().get("fileSize"),
            "chunks": d.to_dict().get("chunks", 0),
            "indexed": d.to_dict().get("indexed", False),
            "createdAt": d.to_dict().get("createdAt"),
            "updatedAt": d.to_dict().get("updatedAt"),
        }
        for d in docs
    ]
    result.sort(key=lambda x: x.get("createdAt") or "", reverse=True)
    return result


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".csv"}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]

    if not await usage_service.check_upload_limit(user_id):
        raise HTTPException(status_code=403, detail="Upload limit reached")

    original_name = os.path.basename(file.filename or "untitled")
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read(settings.MAX_UPLOAD_BYTES + 1)
    if len(content) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large")
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")

    # Extract text before storing anything, so unreadable files fail fast.
    text = await asyncio.to_thread(file_service.extract_text, content, ext)
    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="No extractable text found (scanned/image-only PDFs aren't supported yet)",
        )

    filename = f"{uuid.uuid4()}{ext}"
    storage_path = f"{user_id}/{filename}"
    content_type = file.content_type or "application/octet-stream"
    doc_id = str(uuid.uuid4())

    try:
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            storage_url = await upload_to_supabase(storage_path, content, content_type)
        else:
            def _firebase_upload():
                blob = firebase_service.get_bucket().blob(f"documents/{storage_path}")
                blob.upload_from_string(content, content_type=content_type)
                return blob.public_url
            storage_url = await asyncio.to_thread(_firebase_upload)
    except Exception:
        logger.exception("Storage upload failed")
        raise HTTPException(status_code=502, detail="Failed to store file")

    try:
        chunks_count, _ = await rag_service.index_document(
            document_id=doc_id, document_name=original_name, text=text, user_id=user_id
        )
    except Exception:
        logger.exception("Indexing failed")
        raise HTTPException(status_code=500, detail="Failed to index document")

    now = datetime.datetime.now(datetime.timezone.utc)
    doc_data = {
        "userId": user_id,
        "filename": filename,
        "originalName": original_name,
        "fileType": content_type,
        "fileSize": len(content),
        "storageUrl": storage_url,
        "chunks": chunks_count,
        "indexed": chunks_count > 0,
        # Firestore docs max out at 1 MiB; rawText is used to rebuild the index.
        "rawText": text[:500_000],
        "createdAt": now,
        "updatedAt": now,
    }
    await db.collection("documents").document(doc_id).set(doc_data)
    await usage_service.increment_upload_count(user_id, len(content))

    doc_data.pop("rawText")
    doc_data["id"] = doc_id
    return doc_data


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    doc_ref = db.collection("documents").document(document_id)
    doc = await doc_ref.get()
    if not doc.exists or doc.to_dict().get("userId") != user_id:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()
    try:
        storage_url = data.get("storageUrl", "")
        if storage_url.startswith("supabase:"):
            await delete_from_supabase(storage_url.removeprefix("supabase:"))
        else:
            bucket = firebase_service.get_bucket()
            blob = bucket.blob(f"documents/{user_id}/{data['filename']}")
            await asyncio.to_thread(blob.delete)
    except Exception:
        logger.warning("Failed to delete stored file for %s", document_id, exc_info=True)

    await rag_service.delete_document_chunks(document_id)
    await usage_service.decrement_upload_count(user_id, data.get("fileSize", 0))
    await doc_ref.delete()
