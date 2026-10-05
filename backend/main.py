from contextlib import asynccontextmanager
from pathlib import Path

import env_loader  # noqa: F401
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from admin_routes import router as admin_router
from database import init_db
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


@app.get("/health")
def health():
    return {"ok": True, "service": "acrossicon"}


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


@app.post("/api/license/check")
def api_license_check(req: LicenseCheckRequest):
    status = check_quota(req.license_key, need=req.need)
    payload = status.to_dict()
    if status.plan:
        payload["plan_label"] = plan_label(status.plan)
    if not status.valid:
        raise HTTPException(status_code=403, detail=status.message)
    return payload


@app.post("/api/license/status")
def api_license_status(req: LicenseCheckRequest):
    """등록 시 상태 조회 (한도 초과여도 정보 반환)."""
    status = check_license(req.license_key)
    payload = status.to_dict()
    if status.plan:
        payload["plan_label"] = plan_label(status.plan)
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
    payload = after.to_dict()
    payload["plan_label"] = plan_label(after.plan) if after.plan else ""
    return payload


@app.get("/")
def root():
    return RedirectResponse(url="/ops/")


@app.get("/ops")
@app.get("/ops/")
def ops_index():
    return FileResponse(OPS_DIR / "index.html")


app.mount("/ops", StaticFiles(directory=str(OPS_DIR), html=True), name="ops")
