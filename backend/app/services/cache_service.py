import json
import logging

from app.redis_client import redis_client

logger = logging.getLogger(__name__)


async def get_cached(key: str) -> list | dict | None:
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        logger.warning("Cache get failed for key: %s", key)
    return None


async def set_cache(key: str, value: list | dict, ttl: int = 300) -> None:
    try:
        await redis_client.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        logger.warning("Cache set failed for key: %s", key)


async def invalidate_cache(pattern: str) -> None:
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
    except Exception:
        logger.warning("Cache invalidate failed for pattern: %s", pattern)
