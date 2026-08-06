from fastapi import APIRouter
from app.api.v1 import auth, conversations, crm, finance, tasks, webhooks

api_router = APIRouter()

api_router.include_router(auth.router,          prefix="/auth",          tags=["Auth"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(crm.router,           prefix="/crm",           tags=["CRM"])
api_router.include_router(finance.router,       prefix="/finance",       tags=["Finance"])
api_router.include_router(tasks.router,         prefix="/tasks",         tags=["Tasks"])
api_router.include_router(webhooks.router,      prefix="/integrations",  tags=["Integrations"])