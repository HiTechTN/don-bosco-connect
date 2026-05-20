import json

from app.redis_client import redis_client


async def get_cached(key: str) -> list | dict | None:
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


async def set_cache(key: str, value: list | dict, ttl: int = 300) -> None:
    try:
        await redis_client.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass


async def invalidate_cache(pattern: str) -> None:
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
    except Exception:
        pass
