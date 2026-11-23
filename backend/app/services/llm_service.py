import json
import logging
from typing import AsyncGenerator, List, Optional

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage

from ..core.config import settings

logger = logging.getLogger(__name__)

NO_CONTEXT_ANSWER = (
    "I couldn't find anything relevant to that in your uploaded documents. "
    "Try rephrasing, or check that the right files are uploaded and selected."
)

SYSTEM_PROMPT = """You are a document analyst. Answer the user's question using ONLY the numbered sources below, which are excerpts from the user's uploaded documents.

Rules:
- Analyse and synthesise across sources; don't just quote them.
- Cite sources inline as [Source N] after each claim that relies on them.
- If the sources don't contain the answer, say so plainly. Never invent facts.
- If sources conflict, point out the conflict.
- Use concise Markdown (short headings, bullet points, tables when helpful).

Sources:
{context}"""


class LLMService:
    def __init__(self):
        self._llm = None
        self.provider: Optional[str] = None

    async def initialize(self):
        if self._llm is not None:
            return
        wants_gemini = settings.LLM_PROVIDER.lower() == "gemini" or not settings.GROQ_API_KEY
        if wants_gemini and settings.GEMINI_API_KEY and self._init_gemini():
            return
        if settings.GROQ_API_KEY:
            self._init_groq()
            return
        if settings.GEMINI_API_KEY and self._init_gemini():
            return
        raise RuntimeError("No LLM configured: set GEMINI_API_KEY (or GROQ_API_KEY)")

    def _init_gemini(self) -> bool:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI

            self._llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.2,
                max_output_tokens=4096,
            )
            self.provider = "gemini"
            logger.info("Gemini LLM initialized: %s", settings.GEMINI_MODEL)
            return True
        except Exception as e:
            logger.warning("Gemini init failed: %r", e)
            return False

    def _init_groq(self):
        from langchain_groq import ChatGroq

        self._llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model=settings.LLM_MODEL,
            temperature=0.2,
            max_tokens=4096,
        )
        self.provider = "groq"
        logger.info("Groq LLM initialized: %s", settings.LLM_MODEL)

    def _build_messages(
        self, query: str, context: str, history: Optional[List[dict]]
    ) -> List[BaseMessage]:
        messages: List[BaseMessage] = [SystemMessage(content=SYSTEM_PROMPT.format(context=context))]
        for msg in (history or [])[-6:]:
            cls = HumanMessage if msg.get("role") == "user" else AIMessage
            messages.append(cls(content=msg.get("content", "")))
        messages.append(HumanMessage(content=query))
        return messages

    @staticmethod
    def _text(content) -> str:
        # Gemini can return content as a list of parts
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            return "".join(p.get("text", "") if isinstance(p, dict) else str(p) for p in content)
        return str(content or "")

    async def generate_response(
        self, query: str, context: str, conversation_history: Optional[List[dict]] = None
    ) -> str:
        if not context:
            return NO_CONTEXT_ANSWER
        await self.initialize()
        response = await self._llm.ainvoke(self._build_messages(query, context, conversation_history))
        return self._text(response.content)

    async def generate_streaming_response(
        self, query: str, context: str, conversation_history: Optional[List[dict]] = None
    ) -> AsyncGenerator[str, None]:
        """Yields plain text deltas."""
        if not context:
            yield NO_CONTEXT_ANSWER
            return
        await self.initialize()
        async for chunk in self._llm.astream(self._build_messages(query, context, conversation_history)):
            text = self._text(chunk.content)
            if text:
                yield text


llm_service = LLMService()
