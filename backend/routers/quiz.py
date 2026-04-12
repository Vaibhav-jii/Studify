"""
Quiz generation endpoints.
Generate MCQ quizzes from uploaded study materials using local text analysis.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from database import get_db
from models.db_models import Subject, UploadedFile, FileAnalysis
from models.schemas import QuizRequest, QuizQuestionResponse
from services.ppt_parser import parse_pptx
from services.quiz_generator import generate_quiz
from services.mongo_service import save_quiz, get_quizzes_by_subject
from services.supabase_service import get_public_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/generate")
async def create_quiz(request: QuizRequest, db: Session = Depends(get_db)):
    """
    Generate a quiz for a subject using its uploaded PPT content.
    Extracts text and generates MCQ questions locally (no API needed).
    """
    # Verify subject exists
    subject = db.query(Subject).filter(Subject.id == request.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Get all analyzed files for this subject
    files = (
        db.query(UploadedFile)
        .filter(UploadedFile.subject_id == request.subject_id)
        .all()
    )

    if not files:
        raise HTTPException(
            status_code=400,
            detail="No files uploaded for this subject. Upload study materials first.",
        )

    # Extract text from all PPT files
    all_text_parts: list[str] = []
    import os
    import httpx
    
    for f in files:
        if f.file_type == "ppt" and f.storage_path:
            try:
                file_path = f.storage_path
                # On serverless (Vercel), /tmp is ephemeral, so the file might not exist locally anymore.
                # If not locally present, download it from Supabase temporarily.
                if not os.path.exists(file_path):
                    logger.info(f"File {f.original_name} not found locally. Downloading from Supabase...")
                    
                    # Create a safe temp path in case the DB path is an absolute Linux path like /opt/...
                    import tempfile
                    safe_temp_dir = os.path.join(tempfile.gettempdir(), "studify_downloads")
                    os.makedirs(safe_temp_dir, exist_ok=True)
                    file_path = os.path.join(safe_temp_dir, f.file_name)
                    
                    if not os.path.exists(file_path):
                        cloud_url = get_public_url(f"materials/{f.file_name}")
                        if cloud_url:
                            with httpx.Client() as client:
                                resp = client.get(cloud_url)
                                if resp.status_code == 200:
                                    with open(file_path, "wb") as out_f:
                                        out_f.write(resp.content)
                                    logger.info(f"Downloaded {f.original_name} to {file_path}")
                                else:
                                    logger.error(f"Failed to download from Supabase. Status: {resp.status_code}")
                                    continue # Skip this file
                        else:
                            logger.warning(f"No cloud URL found for {f.original_name}")
                            continue # Skip this file

                parse_result = parse_pptx(file_path)
                if parse_result.full_text:
                    all_text_parts.append(
                        f"--- {f.original_name} ---\n{parse_result.full_text}"
                    )
            except Exception as e:
                logger.warning(f"Could not parse {f.original_name}: {e}")

    if not all_text_parts:
        raise HTTPException(
            status_code=400,
            detail="No text content could be extracted from the uploaded files.",
        )

    combined_text = "\n\n".join(all_text_parts)

    # Generate quiz locally (no API needed)
    questions = generate_quiz(
        content_text=combined_text,
        subject_name=subject.name,
        num_questions=request.num_questions,
    )

    if questions is None:
        raise HTTPException(
            status_code=400,
            detail="Could not generate enough questions from the content. Try uploading more detailed study materials.",
        )

    # Handle both plain dicts and Pydantic models
    quiz_data_for_mongo = [
        q if isinstance(q, dict) else q.dict()
        for q in questions
    ]

    # Save to MongoDB asynchronously
    mongo_id = await save_quiz(request.subject_id, quiz_data_for_mongo)
    
    if mongo_id:
        logger.info(f"Quiz successfully saved to MongoDB with ID: {mongo_id}")
    else:
        logger.warning("Quiz generated but could NOT be saved to MongoDB (Is MONGODB_URI set?).")

    # Return the generated questions and tracking info
    return {
        "mongo_id": mongo_id,
        "questions": questions
    }

@router.get("/subject/{subject_id}")
async def get_quizzes(subject_id: str, db: Session = Depends(get_db)):
    """
    Fetch all previously generated quizzes for a subject from MongoDB.
    """
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    quizzes = await get_quizzes_by_subject(subject_id)
    return {"quizzes": quizzes}
