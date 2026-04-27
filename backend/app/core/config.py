from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PrintMIS API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False

    # Database URL - required for production. Defaults to localhost for development.
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/printmis"

    # CORS origins - comma-separated list of allowed origins
    # Default includes local dev and Vercel domains
    cors_origins: str = "http://localhost:5173,http://localhost:3000,https://*.vercel.app"

    # Security
    secret_key: str = "change-me-in-production"
    admin_username: str = "admin"
    admin_password: str = "admin123"
    access_token_expire_minutes: int = 720

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
