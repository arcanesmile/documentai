import datetime
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud.firestore import AsyncClient

from ..api.deps import get_current_user
from ..core.database import get_database
from ..schemas.search import SearchRequest, SearchResponse
from ..services.llm_service import llm_service
from ..services.rag_service import rag_service
from ..services.usage_service import usage_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]

    if not await usage_service.check_search_limit(user_id):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Search limit reached")

    results = await rag_service.search(
        query=request.query,
        user_id=user_id,
        top_k=request.top_k,
        document_ids=request.documentIds,
    )

    answer = None
    answer_error = None
    if request.analyze:
        try:
            answer = await llm_service.generate_response(
                query=request.query, context=rag_service.build_context(results)
            )
        except Exception as e:
            # Still return the raw matches if the LLM call fails
            logger.exception("LLM analysis failed")
            answer_error = f"AI analysis unavailable: {e.__class__.__name__}"

    await usage_service.increment_search_count(user_id)
    await db.collection("search_history").add({
        "userId": user_id,
        "query": request.query,
        "results": len(results),
        "createdAt": datetime.datetime.now(datetime.timezone.utc),
    })

    return {
        "answer": answer,
        "answerError": answer_error,
        "provider": llm_service.provider if answer else None,
        "results": results,
        "total": len(results),
    }


@router.get("/history")
async def search_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    entries = await db.collection("search_history").where("userId", "==", current_user["id"]).get()
    result = []
    for e in entries:
        d = e.to_dict()
        result.append({
            "id": e.id,
            "query": d.get("query"),
            "results": d.get("results", 0),
            "createdAt": d.get("createdAt"),
        })
    # sort before truncating so we return the *latest* 50
    epoch = datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)
    result.sort(key=lambda x: _as_aware(x["createdAt"]) or epoch, reverse=True)
    return result[:50]


def _as_aware(dt):
    if isinstance(dt, datetime.datetime) and dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt
