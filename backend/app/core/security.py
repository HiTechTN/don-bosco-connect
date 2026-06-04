import base64
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from jose import jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: str) -> tuple[str, str]:
    token_raw = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    return token_raw, token_hash


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        return None


def _get_encryption_key() -> bytes:
    key = settings.ENCRYPTION_KEY
    if not key:
        key = os.urandom(32).hex()
        settings.ENCRYPTION_KEY = key
    if len(key) == 32:
        return key.encode() if isinstance(key, str) else key
    key_bytes = bytes.fromhex(key) if len(key) == 64 else key.encode()
    return key_bytes[:32] if len(key_bytes) > 32 else key_bytes.ljust(32, b"\0")[:32]


def encrypt_message(content: str) -> tuple[str, str]:
    """Encrypt a message with AES-256-GCM. Returns (ciphertext_b64, iv_b64)."""
    key = _get_encryption_key()
    iv = os.urandom(12)
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(iv, content.encode(), None)
    return base64.b64encode(ciphertext).decode(), base64.b64encode(iv).decode()


def decrypt_message(ciphertext_b64: str, iv_b64: str) -> str:
    """Decrypt a message with AES-256-GCM."""
    key = _get_encryption_key()
    ciphertext = base64.b64decode(ciphertext_b64)
    iv = base64.b64decode(iv_b64)
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(iv, ciphertext, None).decode()
