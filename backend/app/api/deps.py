from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.database import get_db
from app.models.base import User

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
    access_token: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Read token from cookie (preferred) or Authorization header (mobile fallback)."""
    token = None
    if credentials:
        token = credentials.credentials
    elif access_token:
        token = access_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "token_missing",
                    "message": "No authentication token provided",
                    "details": None,
                }
            },
        )
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "token_invalid",
                    "message": "Invalid or expired token",
                    "details": None,
                }
            },
        )
    from sqlalchemy import select as _select

    result = await db.execute(_select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if user is None or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {"code": "user_inactive", "message": "User is inactive", "details": None}
            },
        )
    return user


def require_roles(allowed_roles: list[str]):
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": {
                        "code": "forbidden",
                        "message": "Insufficient permissions",
                        "details": None,
                    }
                },
            )
        return current_user

    return _check
