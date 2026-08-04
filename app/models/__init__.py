# Import all models so Alembic autogenerate can detect them
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.ai_employee import AIEmployee, AIEmployeeType
from app.models.conversation import Conversation, Message, ConversationStatus, MessageRole
from app.models.crm import Contact, Lead, LeadStatus
from app.models.finance import Invoice, Quotation, DocumentStatus
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.audit import AuditLog

__all__ = [
    "Organization", "User", "UserRole",
    "AIEmployee", "AIEmployeeType",
    "Conversation", "Message", "ConversationStatus", "MessageRole",
    "Contact", "Lead", "LeadStatus",
    "Invoice", "Quotation", "DocumentStatus",
    "Task", "TaskStatus", "TaskPriority",
    "AuditLog",
]