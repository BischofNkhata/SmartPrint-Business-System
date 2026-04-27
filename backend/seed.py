"""Seed the database with initial users."""

import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.entities import User
from app.db.base import Base

settings = get_settings()


def seed_users():
    """Seed the database with initial users."""
    engine = create_engine(settings.database_url)

    # Create all tables (including users table from migration)
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        # Check if users already exist
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("Admin user already exists, skipping seed.")
            return

        # Create 2 users
        users = [
            User(
                username="admin",
                password_hash=get_password_hash("admin123"),
                role="admin",
            ),
            User(
                username="user",
                password_hash=get_password_hash("user123"),
                role="user",
            ),
        ]

        db.add_all(users)
        db.commit()

        print(f"✓ Seeded database with {len(users)} users:")
        for user in users:
            print(f"  - {user.username} ({user.role})")


if __name__ == "__main__":
    seed_users()

