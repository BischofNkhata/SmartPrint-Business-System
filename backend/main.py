# Backend entrypoint for Vercel
# Vercel looks for app = FastAPI() in this file
import sys
from pathlib import Path

# Add the backend directory to the path so imports work
sys.path.insert(0, str(Path(__file__).parent))

from app.main import app  # noqa: E402, F401

__all__ = ["app"]

