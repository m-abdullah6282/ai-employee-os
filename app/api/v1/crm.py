import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.crm import Contact, Lead
from app.schemas.crm import ContactCreate, ContactOut, LeadCreate, LeadOut, LeadUpdate
from app.core.exceptions import NotFoundError

router = APIRouter()


# ─── CONTACTS ───────────────────────────────────────────

@router.post("/contacts", response_model=ContactOut, status_code=201)
async def create_contact(
    payload: ContactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = Contact(
        **payload.model_dump(),
        organization_id=current_user.organization_id,
    )
    db.add(contact)
    await db.flush()
    return contact


@router.get("/contacts", response_model=list[ContactOut])
async def list_contacts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Contact).where(Contact.organization_id == current_user.organization_id)
    )
    return result.scalars().all()


@router.get("/contacts/{contact_id}", response_model=ContactOut)
async def get_contact(
    contact_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Contact).where(
            Contact.id == contact_id,
            Contact.organization_id == current_user.organization_id,
        )
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise NotFoundError("Contact not found")
    return contact


@router.delete("/contacts/{contact_id}", status_code=204)
async def delete_contact(
    contact_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Contact).where(
            Contact.id == contact_id,
            Contact.organization_id == current_user.organization_id,
        )
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise NotFoundError("Contact not found")
    await db.delete(contact)


# ─── LEADS ──────────────────────────────────────────────

@router.post("/leads", response_model=LeadOut, status_code=201)
async def create_lead(
    payload: LeadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = Lead(
        **payload.model_dump(),
        organization_id=current_user.organization_id,
        owner_id=current_user.id,
    )
    db.add(lead)
    await db.flush()
    return lead


@router.get("/leads", response_model=list[LeadOut])
async def list_leads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Lead).where(Lead.organization_id == current_user.organization_id)
    )
    return result.scalars().all()


@router.patch("/leads/{lead_id}", response_model=LeadOut)
async def update_lead(
    lead_id: uuid.UUID,
    payload: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.organization_id == current_user.organization_id,
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise NotFoundError("Lead not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(lead, key, value)

    return lead


@router.delete("/leads/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.organization_id == current_user.organization_id,
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise NotFoundError("Lead not found")
    await db.delete(lead)