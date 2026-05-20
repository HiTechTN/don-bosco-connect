import json

from app.redis_client import redis_client


async def get_cached(key: str) -> dict | None:
    data = await redis_client.get(key)
    if data:
        return json.loads(data)
    return None


async def set_cache(key: str, value: dict, ttl: int = 300) -> None:
    await redis_client.setex(key, ttl, json.dumps(value, default=str))


async def invalidate_cache(pattern: str) -> None:
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)
