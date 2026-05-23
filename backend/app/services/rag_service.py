import hashlib
import json
from collections.abc import AsyncGenerator

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import DocumentChunk
from app.redis_client import get_redis

SYSTEM_PROMPT = """Tu es le tuteur IA de {subject_name} au collège Don Bosco Tunis.
Tu aides les élèves à comprendre leur programme de cours.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT en te basant sur les documents fournis dans le contexte.
2. Si la réponse n'est pas dans les documents, dis : "Je ne trouve pas cette information"
   " dans tes cours. Demande à ton professeur."
3. Réponds en français, sauf si l'élève écrit en arabe.
4. Adapte ton niveau de langage pour un collégien de {class_level}.
5. Sois encourageant et pédagogique.
6. Ne génère JAMAIS de contenu hors programme scolaire.
"""


async def embed_text(text: str) -> list[float]:
    text_hash = hashlib.sha256(text.encode()).hexdigest()
    cache_key = f"embedding:{text_hash}"

    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/embeddings",
            json={"model": settings.OLLAMA_EMBED_MODEL, "prompt": text},
            timeout=30.0,
        )
        resp.raise_for_status()
        embedding = resp.json()["embedding"]

    try:
        redis = await get_redis()
        await redis.setex(cache_key, 86400, json.dumps(embedding))
    except Exception:
        pass

    return embedding


async def search_similar_chunks(
    db: AsyncSession,
    embedding: list[float],
    course_id: str | None = None,
    top_k: int = 5,
    threshold: float = 0.7,
) -> list[DocumentChunk]:
    query = select(DocumentChunk).order_by(DocumentChunk.embedding.cosine_distance(embedding))
    if course_id:
        query = query.where(DocumentChunk.course_id == course_id)
    query = query.where(DocumentChunk.embedding.cosine_distance(embedding) < (1 - threshold)).limit(
        top_k
    )
    result = await db.execute(query)
    return result.scalars().all()


async def query_rag(
    db: AsyncSession,
    question: str,
    student_id: str,
    course_id: str | None,
    conversation_history: list[dict],
) -> AsyncGenerator[str, None]:
    # 1. Embed la question
    question_embedding = await embed_text(question)

    # 2. Recherche de chunks similaires
    chunks = await search_similar_chunks(
        db,
        question_embedding,
        course_id,
        top_k=settings.RAG_TOP_K,
        threshold=settings.RAG_SIMILARITY_THRESHOLD,
    )

    if not chunks:
        yield "Je ne trouve pas cette information dans tes cours. Demande à ton professeur."
        return

    # 3. Construire le contexte
    context = "\n\n---\n\n".join(
        [
            f"[Source: {chunk.metadata_.get('filename', 'cours')}]\n{chunk.content}"
            for chunk in chunks
        ]
    )

    # 4. Construire les messages
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT.format(subject_name="la matière", class_level="collège"),
        },
        *conversation_history[-10:],
        {"role": "user", "content": f"CONTEXTE DES COURS:\n{context}\n\nQUESTION: {question}"},
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
                "options": {"temperature": 0.3, "num_predict": 1000},
            },
            timeout=60.0,
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


def call_ollama_sync(prompt: str, model: str = None, max_tokens: int = 4096) -> str:
    """Synchronous call to Ollama (used by Celery tasks)."""
    import httpx as sync_httpx

    target_model = model or settings.OLLAMA_CHAT_MODEL
    with sync_httpx.Client(timeout=120.0) as client:
        resp = client.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": target_model,
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": max_tokens, "temperature": 0.3},
            },
        )
        resp.raise_for_status()
        return resp.json().get("response", "")
