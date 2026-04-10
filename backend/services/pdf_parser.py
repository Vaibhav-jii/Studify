"""
PDF parsing service using pypdf (lightweight, pure-Python).
Extracts text content, image counts, and page-level details from .pdf files.
"""

import logging
from typing import List

logger = logging.getLogger(__name__)


class PageInfo:
    """Parsed information for a single PDF page."""

    def __init__(self, page_number: int):
        self.slide_number = page_number  # Keep 'slide_number' for compatibility with PPT logic
        self.text_content: str = ""
        self.word_count: int = 0
        self.char_count: int = 0
        self.image_count: int = 0
        self.has_text: bool = False
        self.has_images: bool = False


class PdfParseResult:
    """Complete parse result for a PDF file."""

    def __init__(self):
        self.slides: List[PageInfo] = []  # Keep 'slides' for compatibility
        self.total_slides: int = 0
        self.total_word_count: int = 0
        self.total_char_count: int = 0
        self.total_image_count: int = 0

    @property
    def full_text(self) -> str:
        """Concatenated text from all pages for AI analysis."""
        return "\n\n".join(
            f"[Page {p.slide_number}] {p.text_content}"
            for p in self.slides
            if p.text_content
        )


def parse_pdf(file_path: str) -> PdfParseResult:
    """
    Parse a .pdf file and extract content details.
    Uses pypdf (pure Python, lightweight) instead of PyMuPDF.
    """
    from pypdf import PdfReader

    result = PdfParseResult()

    try:
        reader = PdfReader(file_path)
    except Exception as e:
        logger.error(f"Failed to open PDF file: {e}")
        raise ValueError(f"Could not parse the PDF file: {e}")

    for page_index, page in enumerate(reader.pages, start=1):
        page_info = PageInfo(page_number=page_index)

        # Extract text
        text = (page.extract_text() or "").strip()
        page_info.text_content = text
        page_info.word_count = len(text.split()) if text else 0
        page_info.char_count = len(text)
        page_info.has_text = page_info.word_count > 0

        # Count images
        try:
            images = page.images
            page_info.image_count = len(images)
        except Exception:
            page_info.image_count = 0
        page_info.has_images = page_info.image_count > 0

        result.slides.append(page_info)

    # Totals
    result.total_slides = len(result.slides)
    result.total_word_count = sum(p.word_count for p in result.slides)
    result.total_char_count = sum(p.char_count for p in result.slides)
    result.total_image_count = sum(p.image_count for p in result.slides)

    return result
