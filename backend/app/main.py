import logging

from fastapi import FastAPI
from starlette.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.routes import router as v1_router
from app.api.v1.auth import router as auth_router
from app.core.config import get_settings
from app.db.session import SessionLocal

settings = get_settings()
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)


@app.middleware("http")
async def _log_auth_requests(request: Request, call_next):
    # Helpful dev logging for intermittent CORS/preflight issues on the auth endpoint
    try:
        if settings.debug and request.url.path.startswith(f"{settings.api_v1_prefix}/auth"):
            logger.debug("Incoming request %s %s headers=%s", request.method, request.url.path, dict(request.headers))
    except Exception:
        logger.exception("Failed to log request headers")
    return await call_next(request)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix=settings.api_v1_prefix)
app.include_router(auth_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def on_startup() -> None:
    # Avoid auto-creating schema; rely on Alembic migrations.
    # We only test connectivity to give a clear startup warning.
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover - startup guard
        logger.warning("Database connection check failed on startup: %s", exc)
