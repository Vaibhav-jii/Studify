"""
Vercel Serverless Function entry point.
Wraps the FastAPI app from backend/main.py so Vercel can serve it.
"""

import sys
import os

# Add the backend directory to Python path so all imports work
backend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend")
sys.path.insert(0, backend_dir)

# Load .env for local testing (Vercel uses dashboard env vars in production)
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

# Import backend modules
from database import engine, Base
from routers import subjects, upload, timetable, dashboard, quiz, auth, prs

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Studify API",
    description="Upload PPT files, analyze study time, and generate timetables",
    version="1.0.0",
)

# CORS — allow Vercel production domain + local dev
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

# Add the Vercel production URL if set
vercel_url = os.getenv("VERCEL_URL")
if vercel_url:
    ALLOWED_ORIGINS.append(f"https://{vercel_url}")

# Add any custom domain
custom_domain = os.getenv("FRONTEND_URL")
if custom_domain:
    ALLOWED_ORIGINS.append(custom_domain)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(subjects.router)
app.include_router(upload.router)
app.include_router(timetable.router)
app.include_router(dashboard.router)
app.include_router(quiz.router)
app.include_router(auth.router)
app.include_router(prs.router)


@app.get("/api")
def api_root():
    return {"message": "Studify API is running on Vercel", "docs": "/api/docs"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# Vercel serverless handler
handler = Mangum(app, lifespan="off")
