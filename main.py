# Top-level FastAPI entrypoint for Vercel
# Vercel looks for a Python entrypoint at known locations (e.g. main.py).
# This file simply re-exports the FastAPI `app` from the package in backend.
# That lets Vercel detect and run the ASGI app.

from backend.app.main import app  # noqa: F401


# Optional: when running locally `python main.py` should not start the server—
# use `uvicorn backend.app.main:app --reload` instead. This file only re-exports `app`.

