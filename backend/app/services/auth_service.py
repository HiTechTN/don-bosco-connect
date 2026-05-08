import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional

import pyotp
import qrcode
from io import BytesIO
import base64

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.base import User, RefreshToken
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.exceptions import ConflictException


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Tuple[Optional[User], Optional[str]]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        return None, "Utilisateur non trouvé"
    if user.status != "active":
        return None, "Compte désactivé"
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        return None, f"Compte verrouillé jusqu'au {user.locked_until.strftime('%Y-%m-%d %H:%M')}"
    if not verify_password(password, user.password_hash):
        user.failed_login_count += 1
        if user.failed_login_count >= 5:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        return None, "Mot de passe incorrect"
    if user.failed_login_count > 0:
        user.failed_login_count = 0
        user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()
    return user, None


async def generate_tokens(db: AsyncSession, user: User) -> Tuple[str, str]:
    access_token = create_access_token(user_id=str(user.id), role=user.role)
    refresh_token_raw, refresh_token_hash = create_refresh_token(user_id=str(user.id))
    refresh_token = RefreshToken(
        id=secrets.token_urlsafe(32),
        user_id=user.id,
        token_hash=refresh_token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(refresh_token)
    await db.commit()
    return access_token, refresh_token_raw


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> Tuple[Optional[str], Optional[str]]:
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    stored_token = result.scalar_one_or_none()
    if not stored_token or stored_token.revoked_at is not None:
        return None, None
    if stored_token.expires_at < datetime.now(timezone.utc):
        return None, None
    result = await db.execute(select(User).where(User.id == stored_token.user_id))
    user = result.scalar_one_or_none()
    if not user or user.status != "active":
        return None, None
    new_access_token = create_access_token(user_id=str(user.id), role=user.role)
    new_refresh_token_raw, new_refresh_token_hash = create_refresh_token(user_id=str(user.id))
    stored_token.token_hash = new_refresh_token_hash
    stored_token.expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.commit()
    return new_access_token, new_refresh_token_raw


async def setup_mfa(db: AsyncSession, user: User) -> dict:
    if user.mfa_enabled:
        raise ConflictException("MFA déjà activé")
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="Don Bosco Connect")
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
    user.mfa_secret = secret
    user.mfa_enabled = False
    await db.commit()
    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_code_base64}"}


async def verify_mfa(db: AsyncSession, user: User, code: str) -> bool:
    if not user.mfa_secret:
        return False
    totp = pyotp.TOTP(user.mfa_secret)
    if totp.verify(code):
        user.mfa_enabled = True
        await db.commit()
        return True
    return False


async def revoke_refresh_token(db: AsyncSession, refresh_token: str):
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    stored_token = result.scalar_one_or_none()
    if stored_token:
        stored_token.revoked_at = datetime.now(timezone.utc)
        await db.commit()