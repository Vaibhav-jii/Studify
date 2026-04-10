"""
MongoDB service — lightweight version with lazy imports.
If motor/pymongo are not installed (e.g. on Vercel), all functions
return None/empty gracefully.
"""

import os
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Try importing motor — it's optional (heavy dependency)
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    HAS_MOTOR = True
except ImportError:
    HAS_MOTOR = False
    logger.info("motor not installed — MongoDB features disabled.")

client = None
db = None
quizzes_collection = None
plans_collection = None
ai_logs_collection = None


def get_mongo_db():
    global client, db, quizzes_collection, plans_collection, ai_logs_collection

    if not HAS_MOTOR:
        return None

    if client is not None:
        return db

    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        logger.warning("MONGODB_URI not set. MongoDB integrations will be disabled.")
        return None

    try:
        client = AsyncIOMotorClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        db = client.studify_db
        quizzes_collection = db.quizzes
        plans_collection = db.study_plans
        ai_logs_collection = db.ai_analysis_logs
        logger.info("Connected to MongoDB successfully.")
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        client = None
        return None

async def save_quiz(subject_id: str, quiz_data: List[Dict[str, Any]]) -> Optional[str]:
    """Save a generated quiz to MongoDB."""
    database = get_mongo_db()
    if database is None:
        return None

    document = {
        "subject_id": subject_id,
        "questions": quiz_data,
        "created_at": datetime.now(timezone.utc)
    }

    try:
        result = await quizzes_collection.insert_one(document)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error saving quiz to MongoDB: {e}")
        return None

async def get_quizzes_by_subject(subject_id: str) -> List[Dict[str, Any]]:
    """Fetch all quizzes for a specific subject from MongoDB."""
    database = get_mongo_db()
    if database is None:
        return []

    try:
        cursor = quizzes_collection.find({"subject_id": subject_id}).sort("created_at", -1)
        quizzes = await cursor.to_list(length=100)

        # Convert ObjectId to string for JSON serialization
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])

        return quizzes
    except Exception as e:
        logger.error(f"Error fetching quizzes from MongoDB: {e}")
        return []

async def save_study_plan(user_id: str, plan_data: Dict[str, Any]) -> Optional[str]:
    """Save a generated study timetable to MongoDB."""
    database = get_mongo_db()
    if database is None:
        return None

    document = {
        "user_id": user_id,
        "plan": plan_data,
        "created_at": datetime.now(timezone.utc)
    }

    try:
        result = await plans_collection.insert_one(document)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error saving study plan to MongoDB: {e}")
        return None

async def get_study_plans_by_user(user_id: str) -> List[Dict[str, Any]]:
    """Fetch all study plans for a specific user from MongoDB."""
    database = get_mongo_db()
    if database is None:
        return []

    try:
        cursor = plans_collection.find({"user_id": user_id}).sort("created_at", -1)
        plans = await cursor.to_list(length=50)

        for plan in plans:
            plan["_id"] = str(plan["_id"])

        return plans
    except Exception as e:
        logger.error(f"Error fetching study plans from MongoDB: {e}")
        return []

async def save_ai_log(file_id: str, prompt: str, raw_response: str) -> Optional[str]:
    """Save raw AI responses for debugging or fine-tuning."""
    database = get_mongo_db()
    if database is None:
        return None

    document = {
        "file_id": file_id,
        "prompt": prompt,
        "raw_response": raw_response,
        "created_at": datetime.now(timezone.utc)
    }

    try:
        result = await ai_logs_collection.insert_one(document)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error saving AI log to MongoDB: {e}")
        return None
