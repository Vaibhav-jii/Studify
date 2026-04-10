"""
AI-powered study time estimation using Google Gemini 2.0 Flash.
Sends extracted PPT content to Gemini for intelligent analysis.
Falls back gracefully to heuristic estimation if API is unavailable.
"""

import json
import os
import logging

logger = logging.getLogger(__name__)

# Lazy-loaded Gemini client
_model = None


def _get_model():
    """Get or create the Gemini model. Returns None if no API key."""
    global _model

    if _model is not None:
        return _model

    api_key = os.environ.get("GEMINI_API_KEY", "")

    if not api_key:
        logger.warning("GEMINI_API_KEY not set — AI estimation disabled, using heuristic fallback")
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel("gemini-2.0-flash")
        logger.info("Gemini AI estimator initialized successfully")
        return _model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        return None


class AIEstimateResult:
    """Result from Gemini AI analysis."""

    def __init__(self):
        self.estimated_study_minutes: float = 0.0
        self.difficulty: str = "medium"
        self.key_topics: list[str] = []
        self.study_tips: list[str] = []
        self.reasoning: str = ""
        self.raw_response: str = ""
        self.prompt: str = ""


def ai_estimate(
    extracted_text: str,
    slide_count: int,
    word_count: int,
    image_count: int,
) -> AIEstimateResult | None:
    """
    Ask Gemini to analyze the PPT content and estimate study time.
    Returns None if Gemini is unavailable.
    """
    model = _get_model()
    if not model:
        return None

    # Truncate text to avoid excessive token usage (keep ~4000 chars)
    truncated_text = extracted_text[:4000]
    if len(extracted_text) > 4000:
        truncated_text += "\n... [content truncated]"

    prompt = f"""You are a study advisor AI. Analyze this university-level study material and provide a realistic study time estimate.

**Material metadata:**
- Slides: {slide_count}
- Total words: {word_count}
- Images/diagrams: {image_count}

**Extracted content:**
{truncated_text}

**Instructions:**
Consider these factors for your estimate:
- Topic complexity and concept density
- Whether prerequisite knowledge is needed
- How many diagrams need careful study
- Note-taking and comprehension time (not just reading)

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{{
  "estimated_study_minutes": <number>,
  "difficulty": "<easy|medium|hard>",
  "key_topics": ["topic1", "topic2", "topic3"],
  "study_tips": ["tip1", "tip2"],
  "reasoning": "<brief 1-2 sentence explanation of your estimate>"
}}"""

    try:
        response = model.generate_content(prompt)

        # Parse the JSON response
        text = response.text.strip()
        raw_response_text = text
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3].strip()
            elif "```" in text:
                text = text[:text.rfind("```")].strip()

        data = json.loads(text)

        result = AIEstimateResult()
        result.raw_response = raw_response_text
        result.prompt = prompt
        result.estimated_study_minutes = float(data.get("estimated_study_minutes", 0))
        result.difficulty = data.get("difficulty", "medium")
        result.key_topics = data.get("key_topics", [])[:8]  # Cap at 8 topics
        result.study_tips = data.get("study_tips", [])[:4]   # Cap at 4 tips
        result.reasoning = data.get("reasoning", "")[:500]    # Cap length

        # Sanity check — ensure estimate is reasonable
        if result.estimated_study_minutes < 1:
            result.estimated_study_minutes = max(slide_count * 2, 5)
        if result.estimated_study_minutes > 1440:  # Cap at 24 hours
            result.estimated_study_minutes = 1440

        logger.info(
            f"Gemini estimated {result.estimated_study_minutes}m "
            f"({result.difficulty}) for {slide_count} slides"
        )
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned invalid JSON: {e}")
        return None
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None
