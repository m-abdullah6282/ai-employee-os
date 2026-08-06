
import uuid
from pydantic import BaseModel, EmailStr
from app.models.crm import LeadStatus


class ContactCreate(BaseModel):
    first_name: str
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    job_title: str | None = None
    notes: str | None = None
    tags: list[str] = []


class ContactOut(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str | None
    email: str | None
    phone: str | None
    company: str | None
    job_title: str | None
    tags: list
    organization_id: uuid.UUID

    model_config = {"from_attributes": True}


class LeadCreate(BaseModel):
    title: str
    contact_id: uuid.UUID
    value: float | None = None
    currency: str = "USD"
    probability: float = 0.0
    notes: str | None = None
    status: LeadStatus = LeadStatus.NEW


class LeadOut(BaseModel):
    id: uuid.UUID
    title: str
    status: LeadStatus
    value: float | None
    currency: str
    probability: float
    contact_id: uuid.UUID
    organization_id: uuid.UUID

    model_config = {"from_attributes": True}


class LeadUpdate(BaseModel):
    title: str | None = None
    status: LeadStatus | None = None
    value: float | None = None
    probability: float | None = None
    notes: str | None = None