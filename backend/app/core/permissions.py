from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.base import User


def require_roles(*roles: str):
    """FastAPI dependency that checks user role."""
    async def _check_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": {"code": "forbidden", "message": "Insufficient permissions", "details": None}},
            )
        return current_user
    return _check_role