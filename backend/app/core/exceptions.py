from fastapi import HTTPException, status

from app.core.error_codes import (
    NOT_FOUND,
    FORBIDDEN,
    CONFLICT,
)


class AppException(HTTPException):
    def __init__(
        self,
        code: str,
        message: str,
        details: str | None = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
    ) -> None:
        super().__init__(
            status_code=status_code,
            detail={"error": {"code": code, "message": message, "details": details}},
        )


class NotFoundException(AppException):
    def __init__(self, resource: str = "resource", error_code: str = NOT_FOUND) -> None:
        super().__init__(
            code=error_code,
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Not authenticated", error_code: str = "unauthorized") -> None:
        super().__init__(
            code=error_code,
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions", error_code: str = FORBIDDEN) -> None:
        super().__init__(
            code=error_code,
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists", error_code: str = CONFLICT) -> None:
        super().__init__(
            code=error_code,
            message=message,
            status_code=status.HTTP_409_CONFLICT,
        )
