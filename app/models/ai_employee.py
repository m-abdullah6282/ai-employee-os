import uuid, enum
from sqlalchemy import String, Boolean, ForeignKey, JSON, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin


class AIEmployeeType(str, enum.Enum):
    EXECUTIVE = "executive"
    SALES = "sales"
    SUPPORT = "support"
    FINANCE = "finance"
    HR = "hr"
    MARKETING = "marketing"
    LEGAL = "legal"


class AIEmployee(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_employees"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[AIEmployeeType] = mapped_column(SAEnum(AIEmployeeType), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    tools_enabled: Mapped[list] = mapped_column(JSON, default=list)   # ["gmail", "calendar", ...]
    permissions: Mapped[dict] = mapped_column(JSON, default=dict)
    memory_config: Mapped[dict] = mapped_column(JSON, default=dict)
    llm_config: Mapped[dict] = mapped_column(JSON, default=dict)       # model, temperature, etc.

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )

    organization: Mapped["Organization"] = relationship("Organization", back_populates="ai_employees")
    conversations: Mapped[list["Conversation"]] = relationship("Conversation", back_populates="ai_employee")