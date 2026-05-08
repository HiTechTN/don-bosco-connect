"""
Celery background tasks for Don Bosco Connect Phase 3.
"""
import logging
import json
from uuid import uuid4

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models.base import CourseFile, DocumentChunk
from app.services.rag_service import embed_text

logger = logging.getLogger(__name__)

# Create engine for async tasks
engine = create_async_engine(settings.DATABASE_URL, echo=False, pool_size=5)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def _index_course_file(file_id: str):
    """Index a course file: read content, chunk, embed, and store chunks."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(CourseFile).where(CourseFile.id == file_id))
        cf = result.scalar_one_or_none()
        if not cf or cf.ai_processing_status != "pending":
            return

        cf.ai_processing_status = "processing"
        await db.commit()

        try:
            content = _extract_text(cf)
            if not content:
                cf.ai_processing_status = "failed"
                await db.commit()
                return

            chunks = _chunk_text(content, max_tokens=500)
            chunk_objs = []

            for idx, chunk_text in enumerate(chunks):
                embedding = await embed_text(chunk_text)
                if embedding:
                    chunk = DocumentChunk(
                        id=uuid4(),
                        file_id=cf.id,
                        course_id=cf.course_id,
                        chunk_index=idx,
                        content=chunk_text,
                        token_count=len(chunk_text.split()),
                        embedding=embedding,
                        metadata={"source": cf.original_filename},
                    )
                    chunk_objs.append(chunk)

            if chunk_objs:
                db.add_all(chunk_objs)

            cf.ai_processing_status = "indexed"
            cf.ai_chunk_count = len(chunk_objs)
            await db.commit()
            logger.info("Indexed %d chunks for file %s", len(chunk_objs), file_id)

        except Exception as e:
            logger.error("Indexing failed for file %s: %s", file_id, e)
            cf.ai_processing_status = "failed"
            await db.commit()


def _extract_text(cf: CourseFile) -> str | None:
    """Extract text from a course file based on its type."""
    from app.minio_client import get_minio

    try:
        minio_client = get_minio()
        response = minio_client.get_object(cf.minio_bucket, cf.minio_key)
        raw = response.read()
        response.close()

        if cf.mime_type == "application/pdf":
            return _extract_pdf_text(raw)
        elif cf.mime_type in ("text/plain", "text/markdown"):
            return raw.decode("utf-8", errors="ignore")
        elif cf.mime_type in (
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ):
            return _extract_docx_text(raw)
        return None
    except Exception as e:
        logger.warning("Extract text failed: %s", e)
        return None


def _extract_pdf_text(raw: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF."""
    import fitz  # PyMuPDF

    doc = fitz.open(stream=raw, filetype="pdf")
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text


def _extract_docx_text(raw: bytes) -> str:
    """Simple DOCX text extraction by looking for XML text nodes."""
    try:
        import zipfile
        import xml.etree.ElementTree as ET
        import io

        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            with z.open("word/document.xml") as f:
                tree = ET.parse(f)
                root = tree.getroot()
                ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                texts = []
                for t in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"):
                    if t.text:
                        texts.append(t.text)
                return "\n".join(texts)
    except Exception:
        return raw.decode("utf-8", errors="ignore")


def _chunk_text(text: str, max_tokens: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks of roughly max_tokens words."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + max_tokens, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += max_tokens - overlap
    return chunks


# ── Celery task wrappers (called by Celery workers) ────────────

def index_course_file(file_id: str):
    """Synchronous Celery entry point for file indexing."""
    import asyncio
    asyncio.run(_index_course_file(file_id))


def compute_daily_analytics():
    """Compute and cache daily analytics aggregates."""
    import asyncio
    asyncio.run(_compute_daily_analytics())


async def _compute_daily_analytics():
    """Pre-compute analytics for caching."""
    from app.services.cache_service import set_cache

    async with AsyncSessionLocal() as db:
        # Total counts
        result = await db.execute(select(text("count(*) FROM users")))
        total_users = result.scalar()
        await set_cache("analytics:daily:total_users", total_users, ttl=86400)

        # Active students in last 7 days
        result = await db.execute(
            select(text("count(*) FROM student_profiles WHERE last_activity_date >= CURRENT_DATE - 7"))
        )
        active_students = result.scalar()
        await set_cache("analytics:daily:active_students", active_students, ttl=86400)

        logger.info("Daily analytics computed: %d users, %d active", total_users, active_students)


def check_dropout_risk():
    """Scheduled task to compute dropout risk for all students."""
    import asyncio
    asyncio.run(_check_dropout_risk())


async def _check_dropout_risk():
    from app.services.gamification_service import get_at_risk_students

    async with AsyncSessionLocal() as db:
        at_risk = await get_at_risk_students(db)
        logger.info("Dropout check: %d students at risk", len(at_risk))

        # Create notifications for high-risk students
        from app.services.notification_service import create_notification
        from app.models.base import NotificationType

        for student in at_risk:
            if student["risk_score"] > 0.7:
                await create_notification(
                    db,
                    user_id=student["student_id"],
                    type=NotificationType.decrochage_alert,
                    title="Alerte décrochage",
                    body=f"Risque détecté : {student['risk_score']*100:.0f}%. Contactez votre enseignant.",
                    data=student,
                )
            # Also notify parents
            result = await db.execute(
                select(text("parent_id FROM student_parent_links WHERE student_id = :sid")),
                {"sid": student["student_id"]},
            )
            for row in result.all():
                await create_notification(
                    db,
                    user_id=str(row[0]),
                    type=NotificationType.decrochage_alert,
                    title="Alerte décrochage - votre enfant",
                    body=f"Votre enfant présente un risque de {student['risk_score']*100:.0f}%.",
                    data=student,
                )