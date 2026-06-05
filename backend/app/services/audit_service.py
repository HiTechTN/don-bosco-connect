"""Audit logging service — records admin actions to audit_logs table."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import AuditLog


async def log_audit(
    db: AsyncSession,
    *,
    user_id: uuid.UUID | str | None = None,
    action: str,
    resource_type: str | None = None,
    resource_id: uuid.UUID | str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """Insert an audit log entry.

    Call this after any state-changing admin operation to maintain a
    tamper-evident record of who did what and when.
    """
    try:
        await db.execute(
            insert(AuditLog).values(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata_=metadata or {},
            )
        )
        # Use commit (not flush) because calling service methods (create/publish/
        # archive/delete) already committed their own transaction before us.
        await db.commit()
    except Exception:
        # Audit logging is supplementary — never let it break the primary operation.
        logging.getLogger(__name__).warning(
            "Failed to write audit log: action=%s resource=%s/%s",
            action, resource_type, resource_id,
            exc_info=True,
        )
