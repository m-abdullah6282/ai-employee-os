from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # App
    app_name: str = "AI Employee OS"
    app_env: str = "development"
    app_secret_key: str = "default-secret-key"
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:3000"]

    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/ai_employee_os"
    database_pool_size: int = 20
    database_max_overflow: int = 10

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Auth
    jwt_secret_key: str = "default-jwt-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # AI
    openai_api_key: str = ""
    groq_api_key: str = ""
    anthropic_api_key: str = ""
    default_llm_provider: str = "openai"
    default_model: str = "gpt-4o"

    # LangSmith
    langchain_tracing_v2: bool = False
    langchain_api_key: str = ""
    langchain_project: str = "ai-employee-os"

    # Integrations
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Storage
    storage_provider: str = "local"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_s3_bucket: str = ""
    aws_region: str = "us-east-1"

    log_level: str = "INFO"
    smtp_host: str = "sandbox.smtp.mailtrap.io"
    smtp_port: int = 2525
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@aiemployee.com"
    mailtrap_api_token: str = ""

    

@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()