import logging
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models import CourseFile, DocumentChunk
from app.services.rag_service import embed_text

logger = logging.getLogger(__name__)

engine = create_async_engine(settings.DATABASE_URL, echo=False, pool_size=5)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def _index_course_file(file_id: str) -> None:
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
                        metadata_={"source": cf.original_filename},
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
    import fitz

    doc = fitz.open(stream=raw, filetype="pdf")
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text


def _extract_docx_text(raw: bytes) -> str:
    try:
        import io
        import xml.etree.ElementTree as ET
        import zipfile

        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            with z.open("word/document.xml") as f:
                tree = ET.parse(f)
                root = tree.getroot()
                texts = []
                for t in root.iter(
                    "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"
                ):
                    if t.text:
                        texts.append(t.text)
                return "\n".join(texts)
    except Exception:
        return raw.decode("utf-8", errors="ignore")


def _chunk_text(text: str, max_tokens: int = 500, overlap: int = 50) -> list[str]:
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


def index_course_file(file_id: str) -> None:
    import asyncio

    asyncio.run(_index_course_file(file_id))
