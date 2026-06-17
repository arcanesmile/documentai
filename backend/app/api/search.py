from fastapi import APIRouter, Depends
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..api.deps import get_current_user
from ..services.rag_service import rag_service
from ..services.usage_service import usage_service
from ..schemas.search import SearchRequest
import uuid
import datetime

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("")
async def search(
    request: SearchRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]

    can_search = await usage_service.check_search_limit(user_id)
    if not can_search:
        return {"results": [], "total": 0, "error": "Search limit reached"}

    results = await rag_service.search(
        query=request.query,
        top_k=request.top_k,
        document_ids=request.documentIds,
        user_id=user_id,
    )

    await usage_service.increment_search_count(user_id)

    history_entry = {
        "userId": user_id,
        "query": request.query,
        "results": len(results),
        "createdAt": datetime.datetime.utcnow(),
    }
    await db.collection("search_history").add(history_entry)

    return {"results": results, "total": len(results)}


@router.get("/history")
async def search_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    entries = await db.collection("search_history").where("userId", "==", user_id).limit(50).get()
    result = [
        {
            "id": e.id,
            "query": e.to_dict().get("query"),
            "results": e.to_dict().get("results", 0),
            "createdAt": e.to_dict().get("createdAt"),
        }
        for e in entries
    ]
    result.sort(key=lambda x: x.get("createdAt") or "", reverse=True)
    return result
