from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    DB_NAME: str = "donbosco"
    DB_USER: str = "donbosco_user"
    DB_PASSWORD: str = ""
    DB_HOST: str = "db"
    DB_PORT: int = 5432

    REDIS_PASSWORD: str = ""
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379

    MINIO_ROOT_USER: str = "donbosco_admin"
    MINIO_ROOT_PASSWORD: str = ""
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_BUCKET_COURSES: str = "courses"
    MINIO_BUCKET_AVATARS: str = "avatars"
    MINIO_SECURE: bool = False

    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_CHAT_MODEL: str = "qwen2.5:7b-instruct"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    OLLAMA_MAX_CONCURRENT_SESSIONS: int = 10
    OLLAMA_MAX_TOKENS_PER_SESSION: int = 2000

    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.70
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64
    AI_DAILY_TOKEN_LIMIT_PER_STUDENT: int = 10000

    GRAFANA_PASSWORD: str = ""

    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost,https://donbosco.local"
    ENCRYPTION_KEY: str = ""

    MAX_UPLOAD_SIZE_MB: int = 200
    ALLOWED_MIME_TYPES: str = (
        "application/pdf,video/mp4,video/webm,image/jpeg,image/png,"
        "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    @property
    def DATABASE_URL(self) -> str:  # noqa: N802
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def REDIS_URL(self) -> str:  # noqa: N802
        return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
