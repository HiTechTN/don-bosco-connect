import time
from contextlib import asynccontextmanager
from datetime import timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram

from app.api.v1.router import v1_router
from app.api.v1.websocket import router as websocket_router
from app.config import settings

# ── Prometheus custom metrics for announcements ──────────────
announcements_published_total = Counter(
    'announcements_published_total', 'Annonces publiées',
    ['category', 'visibility']
)
announcements_views_total = Counter(
    'announcements_views_total', 'Vues annonces',
    ['slug']
)
public_api_latency = Histogram(
    'public_api_request_duration_seconds', 'Latence API publique',
    ['endpoint']
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.minio_client import ensure_buckets

    ensure_buckets()
    yield
    from app.redis_client import close_redis

    await close_redis()


app = FastAPI(
    title="Don Bosco Connect API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Middleware: measure public API latency ────────────────────
@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/api/v1/public/"):
        public_api_latency.labels(endpoint=path).observe(time.time() - start)
    return response


app.include_router(v1_router)
app.include_router(websocket_router)  # WebSocket routes (/ws/v1/...) need no prefix


@app.get("/health")
async def health():
    from datetime import datetime

    from app.database import check_db_connection
    from app.minio_client import check_minio_connection
    from app.redis_client import check_redis_connection

    db_ok = await check_db_connection()
    redis_ok = await check_redis_connection()
    minio_ok = check_minio_connection()

    ollama_ok = False
    try:
        import httpx

        async with httpx.AsyncClient() as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass

    all_ok = db_ok and redis_ok and minio_ok and ollama_ok
    status_code = 200 if all_ok else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ok" if all_ok else "degraded",
            "db": "ok" if db_ok else "error",
            "redis": "ok" if redis_ok else "error",
            "minio": "ok" if minio_ok else "error",
            "ollama": "ok" if ollama_ok else "error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
