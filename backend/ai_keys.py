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


def validate_google_api_key(key: str) -> None:
    """Reject common misconfigurations before calling Google Imagen."""
    k = (key or "").strip()
    if not k:
        return
    if k.startswith("sk-"):
        raise ValueError(
            "Render의 GEMINI_API_KEY에 OpenAI 키(sk-...)가 들어 있습니다. "
            "Google AI Studio에서 복사한 AIzaSy... 키를 넣어 주세요."
        )
    if not k.startswith("AIza"):
        raise ValueError(
            "Render의 GEMINI_API_KEY 형식이 맞지 않습니다. "
            "Google AI Studio → API 키 → 「복사」로 받은 AIzaSy... 전체 문자열을 넣어 주세요. "
            "라이선스 ADMIN-GEMINI나 프로젝트 ID는 API 키가 아닙니다."
        )


def resolve_provider_key(provider: str, *, allow_fallback: bool = True) -> Tuple[str, str]:
    """Return (provider, api_key) or raise ValueError.

    When allow_fallback is False (e.g. ADMIN-GEMINI), do not silently switch to OpenAI.
    """
    p = (provider or "openai").strip().lower()
    if p == "google":
        key = google_api_key()
        if not key:
            if allow_fallback:
                key = openai_api_key()
                if key:
                    return "openai", key
            raise ValueError(
                "서버에 Gemini/Google API 키가 없습니다. "
                "Render Environment에 GEMINI_API_KEY 또는 GOOGLE_API_KEY를 설정하세요."
            )
        validate_google_api_key(key)
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
