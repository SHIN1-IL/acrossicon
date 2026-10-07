import os
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from license_service import (
    PLAN_DEFAULTS,
    activate_license,
    count_deleted_licenses,
    create_license,
    delete_license,
    extend_license,
    get_license,
    list_licenses,
    plan_label,
    restore_license,
    set_note,
    suspend_license,
)
from license_vault import persist_vault, restore_vault, upsert_records

ADMIN_TOKEN = (os.getenv("ADMIN_TOKEN") or "").strip().strip('"').strip("'")

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(x_admin_token: str = Header(..., alias="X-Admin-Token")):
    if not ADMIN_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="Admin API가 비활성화되어 있습니다. ADMIN_TOKEN 환경변수를 설정하세요.",
        )
    got = (x_admin_token or "").strip().strip('"').strip("'")
    if got != ADMIN_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="인증 실패. Render Environment의 ADMIN_TOKEN과 같은지 확인하세요.",
        )


class AdminCreateRequest(BaseModel):
    plan: str = Field(pattern="^(standard|premium|family_standard|family_premium|admin_test)$")
    days: int = 0
    months: int = 0
    license_key: Optional[str] = None
    note: str = ""
    daily_limit: Optional[int] = None
    monthly_limit: Optional[int] = None


class AdminExtendRequest(BaseModel):
    days: int = Field(gt=0)


class AdminNoteRequest(BaseModel):
    note: str = ""


class AdminImportRequest(BaseModel):
    licenses: List[dict]


@router.get("/licenses", dependencies=[Depends(require_admin)])
def admin_list_licenses(deleted: bool = False):
    if deleted:
        return {
            "licenses": list_licenses(deleted_only=True),
            "plans": PLAN_DEFAULTS,
            "deleted_count": count_deleted_licenses(),
            "view": "deleted",
        }
    return {
        "licenses": list_licenses(),
        "plans": PLAN_DEFAULTS,
        "deleted_count": count_deleted_licenses(),
        "view": "active",
    }


@router.post("/licenses", dependencies=[Depends(require_admin)])
def admin_create_license(req: AdminCreateRequest):
    try:
        lic = create_license(
            plan=req.plan,
            days=req.days,
            months=req.months,
            license_key=req.license_key,
            note=req.note or None,
            daily_limit=req.daily_limit,
            monthly_limit=req.monthly_limit,
        )
        lic["plan_label"] = plan_label(lic.get("plan") or "")
        return lic
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/licenses/import", dependencies=[Depends(require_admin)])
def admin_import_licenses(req: AdminImportRequest):
    n = upsert_records(req.licenses)
    persist_vault()
    return {"imported": n, "licenses": list_licenses()}


@router.post("/licenses/restore-vault", dependencies=[Depends(require_admin)])
def admin_restore_vault():
    n = restore_vault()
    return {"restored": n, "licenses": list_licenses()}


@router.get("/licenses/{license_key}", dependencies=[Depends(require_admin)])
def admin_get_license(license_key: str):
    lic = get_license(license_key.strip().upper())
    if not lic:
        raise HTTPException(status_code=404, detail="라이선스를 찾을 수 없습니다.")
    from license_service import _get_usage

    daily_used, monthly_used = _get_usage(lic["license_key"])
    lic["daily_used"] = daily_used
    lic["monthly_used"] = monthly_used
    lic["plan_label"] = plan_label(lic.get("plan") or "")
    return lic


@router.post("/licenses/{license_key}/extend", dependencies=[Depends(require_admin)])
def admin_extend_license(license_key: str, req: AdminExtendRequest):
    try:
        return extend_license(license_key, req.days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/licenses/{license_key}/suspend", dependencies=[Depends(require_admin)])
def admin_suspend_license(license_key: str):
    try:
        return suspend_license(license_key)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/licenses/{license_key}/activate", dependencies=[Depends(require_admin)])
def admin_activate_license(license_key: str):
    try:
        return activate_license(license_key)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/licenses/{license_key}/delete", dependencies=[Depends(require_admin)])
def admin_delete_license(license_key: str):
    try:
        return delete_license(license_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/licenses/{license_key}/restore", dependencies=[Depends(require_admin)])
def admin_restore_license(license_key: str):
    try:
        return restore_license(license_key)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.api_route(
    "/licenses/{license_key}/note",
    methods=["POST", "PATCH"],
    dependencies=[Depends(require_admin)],
)
def admin_set_note(license_key: str, req: AdminNoteRequest):
    try:
        return set_note(license_key, req.note)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
