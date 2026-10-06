from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

import env_loader  # noqa: F401
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from admin_routes import router as admin_router
from ai_keys import configured_providers, resolve_provider_key
from database import init_db
from generate_service import generate_batch
from license_service import (
    check_license,
    check_quota,
    increment_usage,
    log_request,
    plan_label,
    seed_admin_test_key,
)
from license_vault import restore_vault

OPS_DIR = Path(__file__).parent / "ops"
WEB_DIR = Path(__file__).parent / "web"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    restore_vault()
    seed_admin_test_key()
    yield


app = FastAPI(title="AcrossIcon AI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)


class LicenseCheckRequest(BaseModel):
    license_key: str
    need: int = Field(default=1, ge=1, le=4)


class LicenseConsumeRequest(BaseModel):
    license_key: str
    count: int = Field(default=1, ge=1, le=4)


class GenerateRequest(BaseModel):
    license_key: str
    provider: str = "openai"
    prompts: List[str]
    brand_name: str = ""
    size: str = "1024x1024"
    mode: Optional[str] = None
    source_image_data_url: Optional[str] = None
    input_fidelity: str = Field(default="low", pattern="^(high|low)$")


@app.get("/health")
def health():
    ai = configured_providers()
    return {"ok": True, "service": "acrossicon", "ai_ready": ai["ready"]}


@app.get("/api/ai-status")
def ai_status():
    return configured_providers()


@app.get("/api/plans")
def plans():
    return {
        "standard": {
            "label": "스탠다드",
            "price_monthly": 14900,
            "daily_limit": 10,
            "monthly_limit": 60,
        },
        "premium": {
            "label": "프리미엄",
            "price_monthly": 29900,
            "daily_limit": 20,
            "monthly_limit": 120,
        },
    }


def _quota_payload(status):
    payload = status.to_dict()
    if status.plan:
        payload["plan_label"] = plan_label(status.plan)
    return payload


@app.post("/api/license/check")
def api_license_check(req: LicenseCheckRequest):
    status = check_quota(req.license_key, need=req.need)
    payload = _quota_payload(status)
    if not status.valid:
        raise HTTPException(status_code=403, detail=status.message)
    return payload


@app.post("/api/license/status")
def api_license_status(req: LicenseCheckRequest):
    """등록 시 상태 조회 (한도 초과여도 정보 반환)."""
    status = check_license(req.license_key)
    payload = _quota_payload(status)
    if not status.valid:
        raise HTTPException(status_code=403, detail=status.message)
    return payload


@app.post("/api/license/consume")
def api_license_consume(req: LicenseConsumeRequest):
    status = check_quota(req.license_key, need=req.count)
    if not status.valid:
        raise HTTPException(status_code=403, detail=status.message)
    increment_usage(req.license_key, req.count)
    log_request(req.license_key, "consume", success=True)
    after = check_license(req.license_key)
    return _quota_payload(after)


@app.post("/api/generate")
def api_generate(req: GenerateRequest):
    """License check → server AI key → quota consume (customer never sends API key)."""
    need = max(1, min(len([p for p in req.prompts if p and p.strip()]), 4))
    status = check_quota(req.license_key, need=need)
    if not status.valid:
        raise HTTPException(status_code=403, detail=status.message)

    try:
        provider, api_key = resolve_provider_key(req.provider)
        result = generate_batch(
            provider=provider,
            api_key=api_key,
            prompts=req.prompts,
            brand_name=req.brand_name,
            size=req.size,
            mode=req.mode,
            source_image_data_url=req.source_image_data_url,
            input_fidelity=req.input_fidelity,
        )
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        log_request(req.license_key, "generate", success=False)
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    succeeded = int(result.get("succeeded") or 0)
    if succeeded > 0:
        increment_usage(req.license_key, succeeded)
        log_request(req.license_key, "generate", success=True)
    after = check_license(req.license_key)
    result["quota"] = _quota_payload(after)
    result["provider_used"] = provider
    return result


@app.get("/")
def root():
    return RedirectResponse(url="/app/")


@app.get("/ops")
@app.get("/ops/")
def ops_index():
    return FileResponse(OPS_DIR / "index.html")


@app.get("/app")
@app.get("/app/")
def app_index():
    index = WEB_DIR / "index.html"
    if not index.exists():
        alt = WEB_DIR / "web.html"
        if alt.exists():
            return FileResponse(alt)
        raise HTTPException(
            status_code=503,
            detail="웹앱이 아직 빌드되지 않았습니다. npm run build:web 후 재배포하세요.",
        )
    return FileResponse(index)


app.mount("/ops", StaticFiles(directory=str(OPS_DIR), html=True), name="ops")
if WEB_DIR.exists():
    app.mount("/app", StaticFiles(directory=str(WEB_DIR), html=True), name="web")
