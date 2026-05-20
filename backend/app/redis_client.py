import redis.asyncio as redis

from app.config import settings

redis_client: redis.Redis | None = None


async def get_redis() -> redis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
    return redis_client


async def check_redis_connection() -> bool:
    try:
        r = await get_redis()
        await r.ping()
        return True
    except Exception:
        return False


async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
