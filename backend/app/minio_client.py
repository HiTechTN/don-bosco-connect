from minio import Minio

from app.config import settings


minio_client: Minio | None = None


def get_minio() -> Minio:
    global minio_client
    if minio_client is None:
        minio_client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=settings.MINIO_SECURE,
        )
    return minio_client


def check_minio_connection() -> bool:
    try:
        client = get_minio()
        client.list_buckets()
        return True
    except Exception:
        return False


def ensure_buckets():
    client = get_minio()
    for bucket in [settings.MINIO_BUCKET_COURSES, settings.MINIO_BUCKET_AVATARS]:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
