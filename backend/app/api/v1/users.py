import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import ConflictException, NotFoundException
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import StudentParentLink, User, UserRole, UserStatus
from app.schemas.user import UserCreate, UserListResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=UserListResponse)
async def list_users(
    role: UserRole | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.email.ilike(search_term),
            )
        )
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    users = result.scalars().all()
    pages = (total + per_page - 1) // per_page
    return UserListResponse(
        items=[UserResponse.model_validate(user) for user in users],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise ConflictException("Un utilisateur avec cet email existe déjà")
    from app.core.security import hash_password

    hashed_password = hash_password(user_data.password)
    user = User(
        id=uuid.uuid4(),
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        preferred_language=user_data.preferred_language,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("/me/children")
async def get_my_children(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.parent:
        raise HTTPException(status_code=403, detail="Réservé aux parents")
    result = await db.execute(
        select(User)
        .join(StudentParentLink, User.id == StudentParentLink.student_id)
        .where(StudentParentLink.parent_id == current_user.id)
    )
    students = result.scalars().all()
    return [
        {"id": str(s.id), "first_name": s.first_name, "last_name": s.last_name, "email": s.email}
        for s in students
    ]


@router.patch("/me", response_model=UserResponse)
async def update_current_user_info(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_data.first_name is not None:
        current_user.first_name = user_data.first_name
    if user_data.last_name is not None:
        current_user.last_name = user_data.last_name
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    if user_data.preferred_language is not None:
        current_user.preferred_language = user_data.preferred_language
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("Utilisateur non trouvé")
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("Utilisateur non trouvé")
    if user_data.role is not None and user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas modifier votre propre rôle")
    if user_data.email is not None:
        result = await db.execute(
            select(User).where(and_(User.email == user_data.email, User.id != user_uuid))
        )
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise ConflictException("Cet email est déjà utilisé par un autre utilisateur")
        user.email = user_data.email
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.first_name is not None:
        user.first_name = user_data.first_name
    if user_data.last_name is not None:
        user.last_name = user_data.last_name
    if user_data.phone is not None:
        user.phone = user_data.phone
    if user_data.preferred_language is not None:
        user.preferred_language = user_data.preferred_language
    if user_data.status is not None:
        user.status = user_data.status
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("Utilisateur non trouvé")
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400, detail="Vous ne pouvez pas désactiver votre propre compte"
        )
    user.status = UserStatus.inactive
    await db.commit()
    return {"message": "Utilisateur désactivé"}
