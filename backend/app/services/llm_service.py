from typing import Optional, AsyncGenerator
from ..core.config import settings
import json


class LLMService:
    _instance: Optional["LLMService"] = None
    _llm = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self):
        if self._llm is not None:
            return
        provider = settings.LLM_PROVIDER.lower()
        if provider == "gemini":
            await self._init_gemini()
        else:
            await self._init_groq()

    async def _init_groq(self):
        from langchain_groq import ChatGroq
        print(f"Initializing Groq LLM: {settings.LLM_MODEL}")
        self._llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model=settings.LLM_MODEL,
            temperature=0.3,
            max_tokens=4096,
        )
        print("Groq LLM initialized")

    async def _init_gemini(self):
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            from langchain_google_genai import ChatGoogleGenerativeAI
            model = settings.LLM_MODEL if "gemini" in settings.LLM_MODEL else "gemini-2.0-flash"
            print(f"Initializing Gemini LLM: {model}")
            self._llm = ChatGoogleGenerativeAI(
                model=model,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.3,
                max_tokens=4096,
            )
            print("Gemini LLM initialized")
        except Exception as e:
            print(f"Gemini init failed ({e}), falling back to Groq")
            await self._init_groq()

    def _system_prompt(self, context: str) -> str:
        return f"""You are an expert AI assistant specialized in answering questions based on provided document context.

Instructions:
- Answer the question using ONLY the provided context information.
- If the context doesn't contain enough information, say so honestly.
- Provide detailed, thorough answers with specific references to the source material.
- Format your response using Markdown for readability.
- Use bullet points, headings, and code blocks where appropriate.
- Always cite the source document name when referencing specific information.

Context:
{context}"""

    async def generate_response(
        self,
        query: str,
        context: str,
        conversation_history: Optional[list] = None,
    ) -> str:
        if self._llm is None:
            await self.initialize()

        from langchain.schema import HumanMessage, SystemMessage

        messages = [SystemMessage(content=self._system_prompt(context))]

        if conversation_history:
            for msg in conversation_history[-6:]:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                else:
                    messages.append(SystemMessage(content=msg["content"]))

        messages.append(HumanMessage(content=query))

        response = await self._llm.ainvoke(messages)
        return response.content

    async def generate_streaming_response(
        self,
        query: str,
        context: str,
        conversation_history: Optional[list] = None,
    ) -> AsyncGenerator[str, None]:
        if self._llm is None:
            await self.initialize()

        from langchain.schema import HumanMessage, SystemMessage

        messages = [SystemMessage(content=self._system_prompt(context))]

        if conversation_history:
            for msg in conversation_history[-6:]:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                else:
                    messages.append(SystemMessage(content=msg["content"]))

        messages.append(HumanMessage(content=query))

        async for chunk in self._llm.astream(messages):
            if chunk.content:
                yield json.dumps({"content": chunk.content}) + "\n"


llm_service = LLMService()
