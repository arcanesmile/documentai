from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from google.cloud.firestore import AsyncClient, ArrayUnion
from ..core.database import get_database
from ..api.deps import get_current_user
from ..services.rag_service import rag_service
from ..services.llm_service import llm_service
from ..services.usage_service import usage_service
from ..schemas.search import ChatRequest
import uuid
import datetime
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, default=str)}\n\n"


def _now():
    return datetime.datetime.now(datetime.timezone.utc)


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]

    if not await usage_service.check_search_limit(user_id):
        raise HTTPException(status_code=429, detail="Search limit reached")

    conversation_history = None
    conversation_id = request.conversationId
    if conversation_id:
        conv = await db.collection("conversations").document(conversation_id).get()
        if not conv.exists or conv.to_dict().get("userId") != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation_history = [
            {"role": m["role"], "content": m["content"]}
            for m in conv.to_dict().get("messages", [])[-10:]
        ]

    context, sources = await rag_service.get_context_for_query(
        query=request.message,
        user_id=user_id,
        top_k=6,
        document_ids=request.documentIds,
    )
    sources_data = [{**s, "content": s["content"][:300]} for s in sources]

    async def generate():
        nonlocal conversation_id
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            await db.collection("conversations").document(conversation_id).set({
                "userId": user_id,
                "title": request.message[:50] + ("..." if len(request.message) > 50 else ""),
                "messages": [],
                "createdAt": _now(),
                "updatedAt": _now(),
            })
        conv_ref = db.collection("conversations").document(conversation_id)
        await conv_ref.update({
            "messages": ArrayUnion([{
                "id": str(uuid.uuid4()), "role": "user",
                "content": request.message, "createdAt": _now(),
            }]),
            "updatedAt": _now(),
        })
        await usage_service.increment_search_count(user_id)

        response_content = ""
        try:
            async for text in llm_service.generate_streaming_response(
                query=request.message, context=context, conversation_history=conversation_history
            ):
                response_content += text
                yield _sse({"content": text})
        except Exception as e:
            logger.exception("LLM streaming failed")
            yield _sse({"error": f"AI response failed: {e.__class__.__name__}"})
            if not response_content:
                return

        await conv_ref.update({
            "messages": ArrayUnion([{
                "id": str(uuid.uuid4()), "role": "assistant", "content": response_content,
                "createdAt": _now(), "sources": sources_data,
            }]),
            "updatedAt": _now(),
        })
        yield _sse({"done": True, "conversationId": conversation_id, "sources": sources_data})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/conversations")
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    convs = await db.collection("conversations").where("userId", "==", user_id).limit(50).get()
    result = [
        {
            "_id": c.id,
            "userId": c.to_dict().get("userId"),
            "title": c.to_dict().get("title", "New Chat"),
            "messages": c.to_dict().get("messages", []),
            "createdAt": c.to_dict().get("createdAt"),
            "updatedAt": c.to_dict().get("updatedAt"),
        }
        for c in convs
    ]
    result.sort(key=lambda x: x.get("updatedAt") or "", reverse=True)
    return result


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    conv = await db.collection("conversations").document(conversation_id).get()
    if not conv.exists or conv.to_dict().get("userId") != user_id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    data = conv.to_dict()
    data["_id"] = conv.id
    return data


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]
    conv_ref = db.collection("conversations").document(conversation_id)
    conv = await conv_ref.get()
    if not conv.exists or conv.to_dict().get("userId") != user_id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await conv_ref.delete()
