"""Resolve platform AI keys from environment (AutoBlog-style)."""
from __future__ import annotations

import os
from typing import Optional, Tuple


def _env(name: str) -> str:
    return (os.getenv(name) or "").strip().strip('"').strip("'")


def openai_api_key() -> str:
    return _env("OPENAI_API_KEY")


def google_api_key() -> str:
    return _env("GOOGLE_API_KEY") or _env("GEMINI_API_KEY")


def resolve_provider_key(provider: str) -> Tuple[str, str]:
    """Return (provider, api_key) or raise ValueError."""
    p = (provider or "openai").strip().lower()
    if p == "google":
        key = google_api_key()
        if not key:
            # Fall back to OpenAI if Google is not configured.
            key = openai_api_key()
            if key:
                return "openai", key
            raise ValueError(
                "서버에 Google/OpenAI API 키가 없습니다. Render Environment에 OPENAI_API_KEY를 설정하세요."
            )
        return "google", key

    key = openai_api_key()
    if not key:
        raise ValueError(
            "서버에 OPENAI_API_KEY가 없습니다. Render Environment에 키를 등록하세요."
        )
    return "openai", key


def configured_providers() -> dict:
    return {
        "openai": bool(openai_api_key()),
        "google": bool(google_api_key()),
        "ready": bool(openai_api_key() or google_api_key()),
        "default": "openai" if openai_api_key() else ("google" if google_api_key() else None),
    }
