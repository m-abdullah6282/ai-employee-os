import uuid
from datetime import date
from pydantic import BaseModel
from app.models.finance import DocumentStatus


class LineItem(BaseModel):
    name: str
    quantity: float
    unit_price: float
    tax_percent: float = 0.0

    @property
    def total(self) -> float:
        return self.quantity * self.unit_price * (1 + self.tax_percent / 100)


class InvoiceCreate(BaseModel):
    contact_id: uuid.UUID
    issue_date: date
    due_date: date
    line_items: list[LineItem]
    currency: str = "USD"
    discount: float = 0.0
    notes: str | None = None


class InvoiceOut(BaseModel):
    id: uuid.UUID
    invoice_number: str
    status: DocumentStatus
    issue_date: date
    due_date: date
    line_items: list
    subtotal: float
    tax_amount: float
    discount: float
    total: float
    currency: str
    contact_id: uuid.UUID
    organization_id: uuid.UUID

    model_config = {"from_attributes": True}


class QuotationCreate(BaseModel):
    contact_id: uuid.UUID
    valid_until: date | None = None
    line_items: list[LineItem]
    currency: str = "USD"
    discount: float = 0.0
    notes: str | None = None


class QuotationOut(BaseModel):
    id: uuid.UUID
    quote_number: str
    status: DocumentStatus
    valid_until: date | None
    line_items: list
    subtotal: float
    tax_amount: float
    discount: float
    total: float
    currency: str
    contact_id: uuid.UUID
    organization_id: uuid.UUID

    model_config = {"from_attributes": True}