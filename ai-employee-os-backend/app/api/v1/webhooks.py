from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_current_user
from app.models.user import User
from app.integrations.gmail import send_email

router = APIRouter()


class SendEmailRequest(BaseModel):
    to_email: str
    to_name: str = ""
    subject: str
    body: str


class SendEmailResponse(BaseModel):
    success: bool
    message: str = ""
    error: str = ""


@router.post("/send-email", response_model=SendEmailResponse)
async def send_email_endpoint(
    payload: SendEmailRequest,
    current_user: User = Depends(get_current_user),
):
    result = send_email(
        to_email=payload.to_email,
        subject=payload.subject,
        body=payload.body,
        to_name=payload.to_name,
    )

    return SendEmailResponse(
        success=result["success"],
        message=result.get("message", ""),
        error=result.get("error", ""),
    )