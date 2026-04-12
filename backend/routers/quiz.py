"""
Quiz generation endpoints.
Generate MCQ quizzes from uploaded study materials using local text analysis.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import tempfile
import logging

from database import get_db
from models.db_models import Subject, UploadedFile, FileAnalysis
from models.schemas import QuizRequest, QuizQuestionResponse
from services.ppt_parser import parse_pptx
from services.pdf_parser import parse_pdf
from services.quiz_generator import generate_quiz
from services.mongo_service import save_quiz, get_quizzes_by_subject
from services.supabase_service import get_public_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


def _download_from_cloud(file_name: str) -> bytes | None:
    """Download a file from Supabase cloud using the public URL."""
    import httpx
    cloud_url = get_public_url(f"materials/{file_name}")
    if not cloud_url:
        return None
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(cloud_url)
            if resp.status_code == 200:
                return resp.content
            else:
                logger.error(f"Supabase download failed (status {resp.status_code})")
                return None
    except Exception as e:
        logger.error(f"Supabase download error: {e}")
        return None


@router.post("/generate")
async def create_quiz(request: QuizRequest, db: Session = Depends(get_db)):
    """
    Generate a quiz for a subject using its uploaded PPT/PDF content.
    Extracts text and generates MCQ questions locally (no API needed).
    """
    # Verify subject exists
    subject = db.query(Subject).filter(Subject.id == request.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Get all files for this subject
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

    logger.info(f"Quiz generation: found {len(files)} file(s) for subject '{subject.name}'")
    for f in files:
        logger.info(f"  -> {f.original_name} (type={f.file_type}, path={f.storage_path})")

    # Extract text from all PPT and PDF files
    all_text_parts: list[str] = []

    for f in files:
        if f.file_type not in ("ppt", "pdf"):
            logger.info(f"Skipping {f.original_name}: unsupported type '{f.file_type}'")
            continue
        if not f.storage_path:
            logger.warning(f"Skipping {f.original_name}: no storage_path in DB")
            continue

        try:
            file_path = f.storage_path

            # If the file doesn't exist locally (e.g. Render/Vercel ephemeral storage),
            # download it from Supabase into a safe temp directory.
            if not os.path.exists(file_path):
                logger.info(f"File not on disk: {file_path}. Attempting Supabase download...")

                safe_temp_dir = os.path.join(tempfile.gettempdir(), "studify_downloads")
                os.makedirs(safe_temp_dir, exist_ok=True)
                file_path = os.path.join(safe_temp_dir, f.file_name)

                if not os.path.exists(file_path):
                    file_bytes = _download_from_cloud(f.file_name)
                    if file_bytes:
                        with open(file_path, "wb") as out_f:
                            out_f.write(file_bytes)
                        logger.info(f"Downloaded {f.original_name} ({len(file_bytes)} bytes) -> {file_path}")
                    else:
                        logger.error(f"FAILED to download {f.original_name} from Supabase. Skipping.")
                        continue
                else:
                    logger.info(f"Already cached at {file_path}")

            # Parse based on file type
            if f.file_type == "ppt":
                parse_result = parse_pptx(file_path)
            elif f.file_type == "pdf":
                parse_result = parse_pdf(file_path)
            else:
                continue

            if parse_result.full_text:
                all_text_parts.append(
                    f"--- {f.original_name} ---\n{parse_result.full_text}"
                )
                logger.info(f"Extracted {parse_result.total_word_count} words from {f.original_name}")
            else:
                logger.warning(f"No text extracted from {f.original_name}")

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
