from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..api.deps import get_current_user
from ..services.usage_service import usage_service
from ..services.rag_service import rag_service
from ..core.firebase import firebase_service
from ..core.config import settings
import uuid
import datetime
import os
import tempfile
import traceback

router = APIRouter(prefix="/api/documents", tags=["Documents"])


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


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]

    can_upload = await usage_service.check_upload_limit(user_id)
    if not can_upload:
        raise HTTPException(status_code=403, detail="Upload limit reached")

    ext = os.path.splitext(file.filename or "file")[1].lower()
    filename = f"{uuid.uuid4()}{ext}"
    file_size = 0

    temp_path = os.path.join(tempfile.gettempdir(), filename)
    try:
        content = await file.read()
        file_size = len(content)
        with open(temp_path, "wb") as f:
            f.write(content)

        storage_url = ""
        try:
            bucket = firebase_service.get_bucket()
            blob = bucket.blob(f"documents/{user_id}/{filename}")
            blob.upload_from_filename(temp_path)
            blob.make_public()
            storage_url = blob.public_url
        except Exception as e:
            print(f"Storage upload failed (using local fallback): {e}")
            storage_url = ""

        text = ""
        if ext == ".txt":
            text = content.decode("utf-8", errors="ignore")
        elif ext == ".pdf":
            from PyPDF2 import PdfReader
            with open(temp_path, "rb") as f:
                reader = PdfReader(f)
                text = "\n".join(page.extract_text() or "" for page in reader.pages)
        elif ext == ".docx":
            from docx import Document
            doc = Document(temp_path)
            text = "\n".join(p.text for p in doc.paragraphs)
        else:
            text = content.decode("utf-8", errors="ignore")

        doc_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow()

        chunks_count, chunks = await rag_service.index_document(
            document_id=doc_id,
            document_name=file.filename or "untitled",
            text=text,
            user_id=user_id,
        )

        doc_data = {
            "userId": user_id,
            "filename": filename,
            "originalName": file.filename or "untitled",
            "fileType": file.content_type or ext,
            "fileSize": file_size,
            "storageUrl": storage_url,
            "chunks": chunks_count,
            "indexed": chunks_count > 0,
            "rawText": text[:50000],
            "createdAt": now,
            "updatedAt": now,
        }

        await db.collection("documents").document(doc_id).set(doc_data)
        await usage_service.increment_upload_count(user_id, file_size)

        doc_data["id"] = doc_id
        return doc_data

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


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
    bucket = firebase_service.get_bucket()
    blob = bucket.blob(f"documents/{user_id}/{data['filename']}")
    try:
        blob.delete()
    except Exception:
        pass

    await rag_service.delete_document_chunks(document_id)
    await usage_service.decrement_upload_count(user_id, data.get("fileSize", 0))
    await doc_ref.delete()
