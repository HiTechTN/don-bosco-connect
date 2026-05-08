import httpx
from app.config import settings
from app.models.base import DocumentChunk
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pgvector.sqlalchemy import Vector
from typing import AsyncGenerator, Optional
import json

SYSTEM_PROMPT = """Tu es le tuteur IA de {subject_name} au collège Don Bosco Tunis.
Tu aides les élèves à comprendre leur programme de cours.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT en te basant sur les documents fournis dans le contexte.
2. Si la réponse n'est pas dans les documents, dis : "Je ne trouve pas cette information dans tes cours. Demande à ton professeur."
3. Réponds en français, sauf si l'élève écrit en arabe.
4. Adapte ton niveau de langage pour un collégien de {class_level}.
5. Sois encourageant et pédagogique.
6. Ne génère JAMAIS de contenu hors programme scolaire.
"""

async def embed_text(text: str) -> list[float]:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/embeddings",
            json={"model": settings.OLLAMA_EMBED_MODEL, "prompt": text},
            timeout=30.0
        )
        resp.raise_for_status()
        return resp.json()["embedding"]

async def search_similar_chunks(db: AsyncSession, embedding: list[float], course_id: Optional[str] = None, top_k: int = 5, threshold: float = 0.7) -> list[DocumentChunk]:
    query = select(DocumentChunk).order_by(DocumentChunk.embedding.cosine_distance(embedding))
    if course_id:
        query = query.where(DocumentChunk.course_id == course_id)
    query = query.where(DocumentChunk.embedding.cosine_distance(embedding) < (1 - threshold)).limit(top_k)
    result = await db.execute(query)
    return result.scalars().all()

async def query_rag(
    db: AsyncSession,
    question: str,
    student_id: str,
    course_id: Optional[str],
    conversation_history: list[dict]
) -> AsyncGenerator[str, None]:
    # 1. Embed la question
    question_embedding = await embed_text(question)

    # 2. Recherche de chunks similaires
    chunks = await search_similar_chunks(db, question_embedding, course_id, top_k=settings.RAG_TOP_K, threshold=settings.RAG_SIMILARITY_THRESHOLD)

    if not chunks:
        yield "Je ne trouve pas cette information dans tes cours. Demande à ton professeur."
        return

    # 3. Construire le contexte
    context = "\n\n---\n\n".join([
        f"[Source: {chunk.metadata_.get('filename', 'cours')}]\n{chunk.content}"
        for chunk in chunks
    ])

    # 4. Construire les messages
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.format(subject_name="la matière", class_level="collège")},
        *conversation_history[-10:],
        {"role": "user", "content": f"CONTEXTE DES COURS:\n{context}\n\nQUESTION: {question}"}
    ]

    # 5. Streamer la réponse via Ollama
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.OLLAMA_CHAT_MODEL,
                "messages": messages,
                "stream": True,
                "options": {"temperature": 0.3, "num_predict": 1000}
            },
            timeout=60.0
        ) as response:
            response.raise_for_status()
            # Ollama returns NDJSON (newline-delimited JSON), not SSE
            async for line in response.aiter_lines():
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if "message" in data and "content" in data["message"]:
                    yield data["message"]["content"]
                if data.get("done"):
                    break