from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.config import settings
from app.core.security import decode_token, hash_password, verify_password
from app.database import get_db
from app.models.base import User
from app.schemas.auth import (
    LoginRequest,
    MFAVerifyRequest,
    PasswordChangeRequest,
    RefreshRequest,
)
from app.services.auth_service import (
    authenticate_user,
    generate_tokens,
    refresh_access_token,
    revoke_refresh_token,
    setup_mfa,
    verify_mfa,
)

router = APIRouter(prefix="/auth", tags=["auth"])

_security = HTTPBearer(auto_error=False)


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HttpOnly, Secure cookies for access and refresh tokens."""
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_prod,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_prod,
        samesite="strict",
        path="/api/v1/auth/refresh",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Delete auth cookies on logout."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/v1/auth/refresh")


@router.post("/login")
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user, error = await authenticate_user(db, body.email, body.password)
    if error:
        raise HTTPException(status_code=401, detail=error)
    if user.mfa_enabled:
        raise HTTPException(
            status_code=403,
            detail="MFA requis. Utilisez /auth/mfa/verify avec le token temporaire.",
        )
    access, refresh = await generate_tokens(db, user)
    _set_auth_cookies(response, access, refresh)
    # Also return tokens in body for mobile app backward compatibility
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "preferred_language": getattr(user, "preferred_language", "fr"),
            "mfa_enabled": user.mfa_enabled,
        }
    }


@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(None),
    body: RefreshRequest | None = None,
    db: AsyncSession = Depends(get_db),
):
    # Accept refresh token from cookie (preferred) or body (mobile fallback)
    token = refresh_token
    if not token and body:
        token = body.refresh_token
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token manquant")
    tokens = await refresh_access_token(db, token)
    if not tokens:
        raise HTTPException(status_code=401, detail="Refresh token invalide ou expiré")
    _set_auth_cookies(response, tokens[0], tokens[1])
    return {"access_token": tokens[0], "refresh_token": tokens[1], "token_type": "bearer"}


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(None),
    body: RefreshRequest | None = None,
    db: AsyncSession = Depends(get_db),
):
    token = refresh_token
    if not token and body:
        token = body.refresh_token
    if token:
        await revoke_refresh_token(db, token)
    _clear_auth_cookies(response)
    return {"message": "Déconnecté"}


@router.get("/me")
async def get_me(
    credentials: HTTPAuthorizationCredentials | None = Depends(_security),
    access_token: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    """Get current user — reads token from cookie or Authorization header."""
    token = None
    if credentials:
        token = credentials.credentials
    elif access_token:
        token = access_token
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token invalide")
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user or user.status != "active":
        raise HTTPException(status_code=401, detail="Utilisateur inactif")
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "preferred_language": getattr(user, "preferred_language", "fr"),
        "mfa_enabled": user.mfa_enabled,
    }


@router.post("/mfa/setup")
async def mfa_setup(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    if current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA déjà activé")
    data = await setup_mfa(db, current_user)
    return data


@router.post("/mfa/verify")
async def mfa_verify(
    body: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await verify_mfa(db, current_user, body.code):
        raise HTTPException(status_code=400, detail="Code invalide")
    return {"message": "MFA activé"}


@router.post("/password/change")
async def change_password(
    body: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    current_user.password_hash = hash_password(body.new_password)
    await db.commit()
    return {"message": "Mot de passe changé"}
