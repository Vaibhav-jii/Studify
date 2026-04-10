"""
File upload and analysis endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import os
import json
import uuid
import logging

from database import get_db
from models.db_models import UploadedFile as UploadedFileModel, FileAnalysis, Subject
from models.schemas import UploadedFileResponse, FileAnalysisResponse, SlideDetail
from services.ppt_parser import parse_pptx
from services.pdf_parser import parse_pdf
from services.time_estimator import estimate_time
from services.ai_estimator import ai_estimate
from services.supabase_service import upload_file_to_supabase, get_public_url, delete_file_from_supabase
from services.mongo_service import save_ai_log

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/files", tags=["files"])

# Directory for uploaded files
# On Vercel, the filesystem is read-only except /tmp
IS_VERCEL = os.getenv("VERCEL") == "1"
if IS_VERCEL:
    UPLOAD_DIR = "/tmp/uploads"
else:
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".ppt", ".pptx", ".pdf", ".doc", ".docx"}


def _build_file_response(file_record: UploadedFileModel, db: Session) -> dict:
    """Build response dict for an uploaded file."""
    subject = db.query(Subject).filter(Subject.id == file_record.subject_id).first()

    analysis_data = None
    if file_record.analysis:
        a = file_record.analysis
        slides = []
        if a.slide_details_json:
            try:
                slides = json.loads(a.slide_details_json)
            except json.JSONDecodeError:
                slides = []

        # Parse AI topics/tips from JSON if stored
        ai_key_topics = None
        ai_study_tips = None
        if a.ai_key_topics:
            try:
                ai_key_topics = json.loads(a.ai_key_topics)
            except json.JSONDecodeError:
                ai_key_topics = []
        if a.ai_study_tips:
            try:
                ai_study_tips = json.loads(a.ai_study_tips)
            except json.JSONDecodeError:
                ai_study_tips = []

        analysis_data = {
            "slide_count": a.slide_count,
            "total_word_count": a.total_word_count,
            "total_image_count": a.total_image_count,
            "total_char_count": a.total_char_count,
            "estimated_reading_time": a.estimated_reading_time,
            "estimated_study_time": a.estimated_study_time,
            "difficulty": a.difficulty,
            "slides": slides,
            # AI-powered fields
            "ai_estimated_study_time": a.ai_estimated_study_time,
            "ai_difficulty": a.ai_difficulty,
            "ai_key_topics": ai_key_topics,
            "ai_study_tips": ai_study_tips,
            "ai_reasoning": a.ai_reasoning,
        }

    return {
        "id": file_record.id,
        "file_name": file_record.file_name,
        "original_name": file_record.original_name,
        "file_type": file_record.file_type,
        "file_size": file_record.file_size,
        "subject_id": file_record.subject_id,
        "subject_name": subject.name if subject else None,
        "subject_color": subject.color if subject else None,
        "uploaded_at": file_record.uploaded_at,
        "analysis": analysis_data,
    }


@router.post("/upload", response_model=UploadedFileResponse, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    subject_id: str = Form(...),
    db: Session = Depends(get_db),
):
    """
    Upload a file (PPT/PDF/DOC), store it on disk, save metadata to DB,
    and automatically analyze PPT files.
    """
    # Validate subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Validate file extension
    original_name = file.filename or "unknown"
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Determine file type
    file_type = "other"
    if ext in (".ppt", ".pptx"):
        file_type = "ppt"
    elif ext == ".pdf":
        file_type = "pdf"
    elif ext in (".doc", ".docx"):
        file_type = "doc"

    # Save file to disk
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    content = await file.read()
    file_size = len(content)

    with open(file_path, "wb") as f:
        f.write(content)

    # Upload to Supabase asynchronously
    await upload_file_to_supabase(content, safe_name, file.content_type or "application/octet-stream")

    # Create DB record
    file_record = UploadedFileModel(
        id=file_id,
        file_name=safe_name,
        original_name=original_name,
        file_type=file_type,
        file_size=file_size,
        storage_path=file_path,
        subject_id=subject_id,
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)

    # Auto-analyze PPT and PDF files
    if file_type in ("ppt", "pdf"):
        try:
            # Parse based on type
            if file_type == "ppt" and ext == ".pptx":
                parse_result = parse_pptx(file_path)
            elif file_type == "pdf":
                parse_result = parse_pdf(file_path)
            else:
                return _build_file_response(file_record, db)  # Skip others

            time_result = estimate_time(parse_result)

            # Build slide/page details JSON
            slide_details = [
                {
                    "slide_number": s.slide_number,
                    "word_count": s.word_count,
                    "image_count": s.image_count,
                    "has_text": s.has_text,
                    "has_images": s.has_images,
                    "estimated_minutes": s.estimated_minutes,
                }
                for s in time_result.slides
            ]

            analysis = FileAnalysis(
                file_id=file_id,
                slide_count=parse_result.total_slides,
                total_word_count=parse_result.total_word_count,
                total_image_count=parse_result.total_image_count,
                total_char_count=parse_result.total_char_count,
                estimated_reading_time=time_result.estimated_reading_minutes,
                estimated_study_time=time_result.estimated_study_minutes,
                difficulty=time_result.difficulty,
                slide_details_json=json.dumps(slide_details),
            )

            # ── AI-powered analysis via Gemini ──
            try:
                ai_result = ai_estimate(
                    extracted_text=parse_result.full_text,
                    slide_count=parse_result.total_slides,
                    word_count=parse_result.total_word_count,
                    image_count=parse_result.total_image_count,
                )
                if ai_result:
                    # Persist raw AI interactions to help with future debugging/prompt tuning
                    await save_ai_log(file_id, ai_result.prompt, ai_result.raw_response)
                    
                    analysis.ai_estimated_study_time = ai_result.estimated_study_minutes
                    analysis.ai_difficulty = ai_result.difficulty
                    analysis.ai_key_topics = json.dumps(ai_result.key_topics)
                    analysis.ai_study_tips = json.dumps(ai_result.study_tips)
                    analysis.ai_reasoning = ai_result.reasoning
                    # Use AI estimate as the primary if available
                    analysis.estimated_study_time = ai_result.estimated_study_minutes
                    analysis.difficulty = ai_result.difficulty
            except Exception as ai_err:
                logger.warning(f"AI estimation failed (using heuristic): {ai_err}")

            db.add(analysis)
            db.commit()
            db.refresh(file_record)
        except Exception as e:
            logger.error(f"Analysis failed for {original_name}: {e}")
            # File is still saved, analysis just didn't work

    return _build_file_response(file_record, db)


@router.get("/", response_model=list[UploadedFileResponse])
def list_files(
    subject_id: str | None = None,
    db: Session = Depends(get_db),
):
    """List all uploaded files, optionally filtered by subject."""
    query = db.query(UploadedFileModel).order_by(UploadedFileModel.uploaded_at.desc())
    if subject_id:
        query = query.filter(UploadedFileModel.subject_id == subject_id)
    files = query.all()
    return [_build_file_response(f, db) for f in files]


@router.get("/{file_id}", response_model=UploadedFileResponse)
def get_file(file_id: str, db: Session = Depends(get_db)):
    """Get a single file by ID."""
    file_record = db.query(UploadedFileModel).filter(UploadedFileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    return _build_file_response(file_record, db)


@router.delete("/{file_id}", status_code=204)
def delete_file(file_id: str, db: Session = Depends(get_db)):
    """Delete a file from disk and database."""
    file_record = db.query(UploadedFileModel).filter(UploadedFileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete file from disk
    if os.path.exists(file_record.storage_path):
        os.remove(file_record.storage_path)
        
    # Delete file from Supabase
    delete_file_from_supabase(f"materials/{file_record.file_name}")

    db.delete(file_record)
    db.commit()


@router.get("/{file_id}/download")
def download_file(file_id: str, db: Session = Depends(get_db)):
    """Download a file — serves from local disk if available, otherwise from Supabase cloud."""
    file_record = db.query(UploadedFileModel).filter(UploadedFileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # Priority 1: local disk (covers all files uploaded before Supabase was set up)
    if os.path.exists(file_record.storage_path):
        return FileResponse(
            path=file_record.storage_path,
            filename=file_record.original_name,
            media_type="application/octet-stream",
        )

    # Priority 2: Supabase cloud (for files uploaded after cloud storage was enabled)
    cloud_url = get_public_url(f"materials/{file_record.file_name}")
    if cloud_url:
        return {"url": cloud_url, "source": "cloud", "filename": file_record.original_name}

    raise HTTPException(status_code=404, detail="File not found on disk or cloud")
