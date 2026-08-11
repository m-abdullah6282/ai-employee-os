import uuid
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.MEMBER


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    organization_id: uuid.UUID

    model_config = {"from_attributes": True}