"""Server-side image generation proxy (browser CORS bypass)."""
from __future__ import annotations

import base64
import uuid
from typing import Any, Dict, List, Optional, Tuple

import httpx

OPENAI_GEN = "https://api.openai.com/v1/images/generations"
OPENAI_EDIT = "https://api.openai.com/v1/images/edits"
GOOGLE_IMAGEN = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "imagen-3.0-generate-002:predict"
)


def _openai_model(size: str) -> str:
    return "gpt-image-2" if size == "2048x1152" else "gpt-image-1"


def _google_aspect(size: str) -> str:
    return {
        "1024x1536": "3:4",
        "1536x1024": "4:3",
        "2048x1152": "16:9",
    }.get(size, "1:1")


def _data_url_to_bytes(data_url: str) -> Tuple[bytes, str]:
    if "," not in data_url:
        raise ValueError("잘못된 이미지 데이터입니다.")
    header, b64 = data_url.split(",", 1)
    mime = "image/png"
    if ":" in header and ";" in header:
        mime = header.split(":", 1)[1].split(";", 1)[0] or mime
    return base64.b64decode(b64), mime


def _to_data_url(b64: str, mime: str = "image/png") -> str:
    return f"data:{mime};base64,{b64}"


SAFETY_VIOLATION_KO = (
    "안전 가이드라인에 위배되는 단어(성인/민감 콘텐츠)가 포함되어 "
    "이미지를 생성할 수 없습니다. 프롬프트를 수정해 주세요."
)


def humanize_provider_error(message: str) -> str:
    """Map OpenAI/Google safety / policy errors to a clear Korean user message."""
    lower = (message or "").lower()
    markers = (
        "safety_violations",
        "safety system",
        "safety filter",
        "rejected by the safety",
        "content_policy",
        "content policy",
        "content filters",
        "moderation",
        "responsibleaipolicy",
        "rejected as potentially",
        "sexual content",
        "violent content",
    )
    if any(m in lower for m in markers):
        return SAFETY_VIOLATION_KO
    if "prohibited" in lower and "content" in lower:
        return SAFETY_VIOLATION_KO
    if "api key not valid" in lower or "invalid api key" in lower:
        return (
            "Google/Gemini API 키가 올바르지 않습니다. "
            "Render의 GEMINI_API_KEY에 Google AI Studio에서 복사한 Gemini API 키(AIzaSy… 또는 AQ.…)를 넣었는지 확인해 주세요. "
            "앱 설정의 ADMIN-GEMINI는 라이선스 키이며 Render API 키와 다릅니다."
        )
    if "incorrect api key" in lower or "invalid_api_key" in lower:
        return (
            "OpenAI API 키가 올바르지 않습니다. "
            "Render의 OPENAI_API_KEY를 확인해 주세요."
        )
    if "gemini_api_key" in lower or "render의 gemini" in lower:
        return message
    return message


def _openai_result_to_url(payload: Dict[str, Any]) -> Tuple[str, Optional[str]]:
    image = (payload.get("data") or [None])[0] or {}
    if image.get("b64_json"):
        return _to_data_url(image["b64_json"]), image.get("revised_prompt")
    if image.get("url"):
        return image["url"], image.get("revised_prompt")
    raise RuntimeError("No image returned from OpenAI.")


def generate_openai(
    api_key: str,
    prompt: str,
    size: str,
    source_image_data_url: Optional[str] = None,
    input_fidelity: str = "low",
) -> Tuple[str, Optional[str]]:
    model = _openai_model(size)
    headers = {"Authorization": f"Bearer {api_key}"}

    with httpx.Client(timeout=180.0) as client:
        if source_image_data_url:
            raw, mime = _data_url_to_bytes(source_image_data_url)
            ext = "png" if "png" in mime else "jpg"
            files = {"image": (f"source.{ext}", raw, mime)}
            data: Dict[str, str] = {
                "model": model,
                "prompt": prompt,
                "n": "1",
                "size": size,
                "quality": "medium",
                "output_format": "png",
            }
            if model != "gpt-image-2":
                data["input_fidelity"] = input_fidelity
            res = client.post(OPENAI_EDIT, headers=headers, data=data, files=files)
        else:
            res = client.post(
                OPENAI_GEN,
                headers={**headers, "Content-Type": "application/json"},
                json={
                    "model": model,
                    "prompt": prompt,
                    "n": 1,
                    "size": size,
                    "quality": "medium",
                    "output_format": "png",
                    "background": "opaque",
                },
            )

        try:
            payload = res.json()
        except Exception as exc:
            raise RuntimeError(f"OpenAI 응답 파싱 실패 ({res.status_code})") from exc

        if res.status_code >= 400:
            err = (payload.get("error") or {}).get("message") or f"OpenAI API error ({res.status_code})"
            raise RuntimeError(err)

        return _openai_result_to_url(payload)


def generate_google(api_key: str, prompt: str, size: str) -> str:
    # Auth keys (AQ.…) work reliably via x-goog-api-key; legacy AIza keys accept both.
    url = GOOGLE_IMAGEN
    with httpx.Client(timeout=180.0) as client:
        res = client.post(
            url,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            },
            json={
                "instances": [{"prompt": prompt}],
                "parameters": {
                    "sampleCount": 1,
                    "aspectRatio": _google_aspect(size),
                },
            },
        )
        try:
            payload = res.json()
        except Exception as exc:
            raise RuntimeError(f"Google 응답 파싱 실패 ({res.status_code})") from exc

        if res.status_code >= 400:
            err = (payload.get("error") or {}).get("message") or f"Google Imagen API error ({res.status_code})"
            raise RuntimeError(err)

        prediction = (payload.get("predictions") or [None])[0] or {}
        b64 = prediction.get("bytesBase64Encoded")
        if not b64:
            raise RuntimeError(
                "No image returned from Google Imagen. Check that Imagen is enabled for your API key."
            )
        mime = prediction.get("mimeType") or "image/png"
        return _to_data_url(b64, mime)


def generate_batch(
    *,
    provider: str,
    api_key: str,
    prompts: List[str],
    brand_name: str,
    size: str,
    mode: Optional[str] = None,
    source_image_data_url: Optional[str] = None,
    input_fidelity: str = "low",
) -> Dict[str, Any]:
    safe = [p.strip() for p in prompts if p and p.strip()][:4]
    if not safe:
        raise ValueError("생성할 프롬프트가 없습니다.")
    if not api_key.strip():
        raise ValueError("API Key가 등록되지 않았습니다.")
    if source_image_data_url and provider != "openai":
        raise ValueError("이미지 업로드 변환은 OpenAI Provider에서만 지원됩니다.")

    logos: List[Dict[str, Any]] = []
    errors: List[str] = []

    for index, prompt in enumerate(safe):
        try:
            if provider == "google":
                url = generate_google(api_key, prompt, size)
                revised = prompt
            else:
                url, revised = generate_openai(
                    api_key,
                    prompt,
                    size,
                    source_image_data_url,
                    input_fidelity,
                )
            logos.append(
                {
                    "id": f"{uuid.uuid4()}-{index}",
                    "url": url,
                    "prompt": revised or prompt,
                    "brandName": brand_name,
                    "createdAt": 0,
                    "mode": mode,
                    "size": size,
                }
            )
        except Exception as exc:  # noqa: BLE001
            errors.append(humanize_provider_error(str(exc)))

    if not logos:
        raise RuntimeError(
            humanize_provider_error(errors[0] if errors else "이미지 생성에 실패했습니다.")
        )

    return {
        "logos": logos,
        "requested": len(safe),
        "succeeded": len(logos),
        "failed": len(errors),
        "errors": errors,
    }
