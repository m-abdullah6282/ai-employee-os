import uuid
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.finance import Invoice, Quotation
from app.schemas.finance import InvoiceCreate, InvoiceOut, QuotationCreate, QuotationOut
from app.core.exceptions import NotFoundError

router = APIRouter()


def calculate_totals(line_items: list) -> dict:
    subtotal = sum(item["quantity"] * item["unit_price"] for item in line_items)
    tax_amount = sum(
        item["quantity"] * item["unit_price"] * item.get("tax_percent", 0) / 100
        for item in line_items
    )
    return {"subtotal": subtotal, "tax_amount": tax_amount}


async def next_invoice_number(db: AsyncSession, org_id: uuid.UUID) -> str:
    result = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.organization_id == org_id)
    )
    count = result.scalar() or 0
    return f"INV-{str(count + 1).zfill(4)}"


async def next_quote_number(db: AsyncSession, org_id: uuid.UUID) -> str:
    result = await db.execute(
        select(func.count(Quotation.id)).where(Quotation.organization_id == org_id)
    )
    count = result.scalar() or 0
    return f"QT-{str(count + 1).zfill(4)}"


# ─── INVOICES ───────────────────────────────────────────

@router.post("/invoices", response_model=InvoiceOut, status_code=201)
async def create_invoice(
    payload: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = [item.model_dump() for item in payload.line_items]
    totals = calculate_totals(items)
    total = totals["subtotal"] + totals["tax_amount"] - payload.discount

    invoice_number = await next_invoice_number(db, current_user.organization_id)

    invoice = Invoice(
        invoice_number=invoice_number,
        contact_id=payload.contact_id,
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        line_items=items,
        subtotal=totals["subtotal"],
        tax_amount=totals["tax_amount"],
        discount=payload.discount,
        total=total,
        currency=payload.currency,
        notes=payload.notes,
        organization_id=current_user.organization_id,
    )
    db.add(invoice)
    await db.flush()
    return invoice


@router.get("/invoices", response_model=list[InvoiceOut])
async def list_invoices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Invoice).where(Invoice.organization_id == current_user.organization_id)
    )
    return result.scalars().all()


@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(
    invoice_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Invoice).where(
            Invoice.id == invoice_id,
            Invoice.organization_id == current_user.organization_id,
        )
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise NotFoundError("Invoice not found")
    return invoice


# ─── QUOTATIONS ─────────────────────────────────────────

@router.post("/quotations", response_model=QuotationOut, status_code=201)
async def create_quotation(
    payload: QuotationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = [item.model_dump() for item in payload.line_items]
    totals = calculate_totals(items)
    total = totals["subtotal"] + totals["tax_amount"] - payload.discount

    quote_number = await next_quote_number(db, current_user.organization_id)

    quotation = Quotation(
        quote_number=quote_number,
        contact_id=payload.contact_id,
        valid_until=payload.valid_until,
        line_items=items,
        subtotal=totals["subtotal"],
        tax_amount=totals["tax_amount"],
        discount=payload.discount,
        total=total,
        currency=payload.currency,
        notes=payload.notes,
        organization_id=current_user.organization_id,
    )
    db.add(quotation)
    await db.flush()
    return quotation


@router.get("/quotations", response_model=list[QuotationOut])
async def list_quotations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Quotation).where(Quotation.organization_id == current_user.organization_id)
    )
    return result.scalars().all()