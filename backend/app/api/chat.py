from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from google.cloud.firestore import AsyncClient
from ..core.database import get_database
from ..api.deps import get_current_user
from ..services.rag_service import rag_service
from ..services.llm_service import llm_service
from ..services.usage_service import usage_service
from ..schemas.search import ChatRequest
import uuid
import datetime
import json

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_database),
):
    user_id = current_user["id"]

    can_search = await usage_service.check_search_limit(user_id)
    if not can_search:
        return StreamingResponse(
            iter([json.dumps({"error": "Search limit reached"}) + "\n"]),
            media_type="text/event-stream",
        )

    try:
        context, sources = await rag_service.get_context_for_query(
            query=request.message,
            top_k=5,
            document_ids=request.documentIds,
            user_id=user_id,
        )
    except RuntimeError as e:
        return StreamingResponse(
            iter([json.dumps({"error": str(e)}) + "\n"]),
            media_type="text/event-stream",
        )

    conversation_history = None
    conversation_id = request.conversationId

    if conversation_id:
        conv = await db.collection("conversations").document(conversation_id).get()
        if conv.exists:
            conversation_history = [
                {"role": m["role"], "content": m["content"]}
                for m in conv.to_dict().get("messages", [])[-10:]
            ]

    async def generate():
        nonlocal conversation_id
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            now = datetime.datetime.utcnow()
            await db.collection("conversations").document(conversation_id).set({
                "userId": user_id,
                "title": request.message[:50] + ("..." if len(request.message) > 50 else ""),
                "messages": [],
                "createdAt": now,
                "updatedAt": now,
            })

        user_msg = {
            "id": str(uuid.uuid4()),
            "role": "user",
            "content": request.message,
            "createdAt": datetime.datetime.utcnow(),
        }
        conv_ref = db.collection("conversations").document(conversation_id)
        conv_doc = await conv_ref.get()
        msgs = conv_doc.to_dict().get("messages", [])
        msgs.append(user_msg)
        await conv_ref.update({"messages": msgs, "updatedAt": datetime.datetime.utcnow()})

        await usage_service.increment_search_count(user_id)

        response_content = ""
        async for chunk in llm_service.generate_streaming_response(
            query=request.message,
            context=context,
            conversation_history=conversation_history,
        ):
            response_content += json.loads(chunk)["content"]
            yield f"data: {chunk}\n\n"

        sources_data = [
            {
                "id": s["id"],
                "content": s["content"][:200],
                "documentId": s["documentId"],
                "documentName": s["documentName"],
                "similarity": s["similarity"],
                "chunkIndex": s["chunkIndex"],
            }
            for s in sources
        ]

        assistant_msg = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": response_content,
            "createdAt": datetime.datetime.utcnow(),
            "sources": sources_data,
        }
        conv_doc2 = await conv_ref.get()
        msgs2 = conv_doc2.to_dict().get("messages", [])
        msgs2.append(assistant_msg)
        await conv_ref.update({"messages": msgs2, "updatedAt": datetime.datetime.utcnow()})

        yield f"data: {json.dumps({'done': True, 'conversationId': conversation_id, 'sources': sources_data})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


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
