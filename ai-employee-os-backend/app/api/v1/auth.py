from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserResponse
from app.models.user import User
from app.models.organization import Organization
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import ConflictError, AuthenticationError, BadRequestError
import uuid

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check email exists
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise ConflictError("Email already registered")

    # Create organization
    slug = payload.organization_name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:8]
    org = Organization(name=payload.organization_name, slug=slug)
    db.add(org)
    await db.flush()  # get org.id

    # Create user
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        organization_id=org.id,
        role="owner",
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    access_token = create_access_token(str(user.id), {"org_id": str(org.id), "role": user.role})
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise AuthenticationError("Invalid email or password")

    if not verify_password(payload.password, user.hashed_password):
        raise AuthenticationError("Invalid email or password")

    if not user.is_active:
        raise AuthenticationError("Account is deactivated")

    access_token = create_access_token(str(user.id), {"org_id": str(user.organization_id), "role": user.role})
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise BadRequestError("Invalid refresh token")
        user_id = decoded.get("sub")
    except ValueError:
        raise AuthenticationError("Invalid or expired refresh token")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise AuthenticationError()

    access_token = create_access_token(str(user.id), {"org_id": str(user.organization_id), "role": user.role})
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user