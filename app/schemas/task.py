import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.task import TaskStatus, TaskPriority


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: datetime | None = None
    tags: list[str] = []


class TaskOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None
    tags: list
    organization_id: uuid.UUID

    model_config = {"from_attributes": True}


class TaskUpdate(BaseModel):
    title: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None