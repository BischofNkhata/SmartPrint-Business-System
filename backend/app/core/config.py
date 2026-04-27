from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PrintMIS API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/printmis"
    cors_origins: str = "http://localhost:5173"
    secret_key: str = "change-me"
    admin_username: str = "admin"
    admin_password: str = "admin123"
    access_token_expire_minutes: int = 720

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
