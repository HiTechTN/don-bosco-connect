from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.api.deps import get_current_user
from app.models.base import User
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, PasswordChangeRequest, MFAVerifyRequest
from app.services.auth_service import authenticate_user, generate_tokens, refresh_access_token, setup_mfa, verify_mfa, revoke_refresh_token
from app.core.security import verify_password, hash_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user, error = await authenticate_user(db, body.email, body.password)
    if error:
        raise HTTPException(status_code=401, detail=error)
    if user.mfa_enabled:
        raise HTTPException(status_code=403, detail="MFA requis. Utilisez /auth/mfa/verify avec le token temporaire.")
    access, refresh = await generate_tokens(db, user)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    tokens = await refresh_access_token(db, body.refresh_token)
    if not tokens:
        raise HTTPException(status_code=401, detail="Refresh token invalide ou expiré")
    return TokenResponse(access_token=tokens[0], refresh_token=tokens[1])


@router.post("/logout")
async def logout(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await revoke_refresh_token(db, body.refresh_token)
    return {"message": "Déconnecté"}


@router.post("/mfa/setup")
async def mfa_setup(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA déjà activé")
    data = await setup_mfa(db, current_user)
    return data


@router.post("/mfa/verify")
async def mfa_verify(body: MFAVerifyRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not await verify_mfa(db, current_user, body.code):
        raise HTTPException(status_code=400, detail="Code invalide")
    return {"message": "MFA activé"}


@router.post("/password/change")
async def change_password(body: PasswordChangeRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    current_user.password_hash = hash_password(body.new_password)
    await db.commit()
    return {"message": "Mot de passe changé"}