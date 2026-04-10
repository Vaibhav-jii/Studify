"""
Database configuration and session management using SQLAlchemy + SQLite.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Detect if running on Vercel (serverless — read-only filesystem except /tmp)
IS_VERCEL = os.getenv("VERCEL") == "1"

if IS_VERCEL:
    DATABASE_DIR = "/tmp"
else:
    DATABASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(DATABASE_DIR, exist_ok=True)

# Use Supabase URL from environment or fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'studify.db')}"

# PostgreSQL needs a different pool configuration sometimes, but SQLAlchemy handles it.
# 'check_same_thread' is ONLY for SQLite.
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Use standard engine for PostgreSQL (Supabase)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
