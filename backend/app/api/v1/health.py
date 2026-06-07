import logging

import httpx
from fastapi import APIRouter
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.minio_client import minio_client
from app.redis_client import redis_client

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health_check():
    health = {"status": "ok", "db": False, "redis": False, "minio": False, "ollama": False}
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health["db"] = True
    except Exception:
        logger.warning("Database health check failed")
        health["status"] = "degraded"
    try:
        await redis_client.ping()
        health["redis"] = True
    except Exception:
        logger.warning("Redis health check failed")
        health["status"] = "degraded"
    try:
        minio_client.list_buckets()
        health["minio"] = True
    except Exception:
        logger.warning("MinIO health check failed")
        health["status"] = "degraded"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=5.0)
            if resp.status_code == 200:
                health["ollama"] = True
    except Exception:
        logger.warning("Ollama health check failed")
        health["status"] = "degraded"
    return health, 200 if health["status"] == "ok" else 503
