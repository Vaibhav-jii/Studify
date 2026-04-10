"""
Supabase Storage service — lightweight version using httpx.
Avoids the heavy `supabase` Python SDK to fit Vercel's 250MB limit.
Falls back gracefully if SUPABASE_URL/KEY are not set.
"""

import os
import asyncio
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)


def _get_config():
    """Get Supabase config from environment."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None, None
    return url, key


BUCKET_NAME = "materials"


async def upload_file_to_supabase(file_content: bytes, file_name: str, content_type: str) -> Optional[str]:
    """Upload a file to Supabase Storage using REST API."""
    url, key = _get_config()
    if not url or not key:
        logger.warning("SUPABASE_URL/KEY not set — storage disabled.")
        return None

    try:
        upload_url = f"{url}/storage/v1/object/{BUCKET_NAME}/{file_name}"
        async with httpx.AsyncClient() as client:
            resp = await client.put(
                upload_url,
                content=file_content,
                headers={
                    "Authorization": f"Bearer {key}",
                    "apikey": key,
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
                timeout=30.0,
            )
            if resp.status_code in (200, 201):
                logger.info(f"Uploaded {file_name} to Supabase Storage.")
                return f"{BUCKET_NAME}/{file_name}"
            else:
                logger.error(f"Supabase upload failed ({resp.status_code}): {resp.text}")
                return None
    except Exception as e:
        logger.error(f"Supabase upload error: {e}")
        return None


def get_public_url(storage_path: str) -> Optional[str]:
    """Get a public URL for a file in Supabase Storage."""
    url, key = _get_config()
    if not url or not storage_path:
        return None

    parts = storage_path.split("/", 1)
    bucket = parts[0] if len(parts) > 1 else BUCKET_NAME
    path = parts[1] if len(parts) > 1 else storage_path

    return f"{url}/storage/v1/object/public/{bucket}/{path}"


def delete_file_from_supabase(storage_path: str):
    """Delete a file from Supabase Storage."""
    url, key = _get_config()
    if not url or not key or not storage_path:
        return

    parts = storage_path.split("/", 1)
    bucket = parts[0] if len(parts) > 1 else BUCKET_NAME
    path = parts[1] if len(parts) > 1 else storage_path

    try:
        delete_url = f"{url}/storage/v1/object/{bucket}/{path}"
        resp = httpx.delete(
            delete_url,
            headers={
                "Authorization": f"Bearer {key}",
                "apikey": key,
            },
            timeout=10.0,
        )
        if resp.status_code not in (200, 204):
            logger.error(f"Supabase delete failed ({resp.status_code}): {resp.text}")
    except Exception as e:
        logger.error(f"Error deleting from Supabase: {e}")
