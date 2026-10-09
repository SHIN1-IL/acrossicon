import secrets
import string
from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo

from database import get_db
from license_vault import persist_vault

KST = ZoneInfo("Asia/Seoul")

# AcrossIcon 판매 플랜 (이미지 장수 기준)
PLAN_DEFAULTS = {
    "standard": {"daily_limit": 20, "monthly_limit": 60},
    "premium": {"daily_limit": 30, "monthly_limit": 120},
    "family_standard": {"daily_limit": 20, "monthly_limit": 60},
    "family_premium": {"daily_limit": 30, "monthly_limit": 120},
    "admin_test": {"daily_limit": 30, "monthly_limit": 999999},
}

PLAN_LABELS = {
    "standard": "스탠다드",
    "premium": "프리미엄",
    "family_standard": "스탠다드 지인",
    "family_premium": "프리미엄 지인",
    "admin_test": "관리자테스트",
}

ADMIN_TEST_KEY = "ADMIN-TEST"


@dataclass
class LicenseStatus:
    valid: bool
    message: str = ""
    remaining_days: int = 0
    expires: str = ""
    plan: str = ""
    plan_label: str = ""
    daily_used: int = 0
    daily_limit: int = 0
    monthly_used: int = 0
    monthly_limit: int = 0
    started_at: str = ""
    duration_days: int = 0

    def to_dict(self) -> dict:
        return asdict(self)


def plan_label(plan: str) -> str:
    return PLAN_LABELS.get(plan, plan)


def today_kst() -> date:
    return datetime.now(KST).date()


def year_month_kst() -> str:
    d = today_kst()
    return f"{d.year:04d}-{d.month:02d}"


def generate_license_key() -> str:
    chars = string.ascii_uppercase + string.digits
    parts = ["".join(secrets.choice(chars) for _ in range(4)) for _ in range(3)]
    return "-".join(parts)


def _parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def _persist_vault() -> None:
    try:
        persist_vault()
    except Exception:
        pass


def _get_usage(license_key: str) -> tuple[int, int]:
    today = today_kst().isoformat()
    ym = year_month_kst()
    with get_db() as conn:
        daily_row = conn.execute(
            "SELECT count FROM usage_daily WHERE license_key = ? AND date = ?",
            (license_key, today),
        ).fetchone()
        monthly_row = conn.execute(
            "SELECT count FROM usage_monthly WHERE license_key = ? AND year_month = ?",
            (license_key, ym),
        ).fetchone()
    return (
        daily_row["count"] if daily_row else 0,
        monthly_row["count"] if monthly_row else 0,
    )


def get_license(license_key: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM licenses WHERE license_key = ?",
            (license_key,),
        ).fetchone()
    return dict(row) if row else None


def _begin_plan_if_needed(license_key: str) -> Optional[dict]:
    lic = get_license(license_key)
    if not lic or lic.get("started_at"):
        return lic
    duration = lic.get("duration_days")
    if not duration:
        return lic
    start = today_kst()
    expires = (start + timedelta(days=int(duration))).isoformat()
    with get_db() as conn:
        conn.execute(
            """
            UPDATE licenses
            SET started_at = ?, expires_at = ?, updated_at = datetime('now')
            WHERE license_key = ? AND started_at IS NULL
            """,
            (start.isoformat(), expires, license_key),
        )
    _persist_vault()
    return get_license(license_key)


def check_license(license_key: str) -> LicenseStatus:
    key = (license_key or "").strip().upper()
    lic = _begin_plan_if_needed(key)
    if not lic:
        return LicenseStatus(valid=False, message="등록되지 않았거나 만료된 라이선스입니다.")

    if lic["status"] == "deleted":
        return LicenseStatus(valid=False, message="삭제된 라이선스입니다. 문의해 주세요.")

    if lic["status"] == "suspended":
        return LicenseStatus(valid=False, message="정지된 라이선스입니다. 문의해 주세요.")

    expire_date = _parse_date(lic["expires_at"])
    remaining = (expire_date - today_kst()).days
    if remaining < 0:
        return LicenseStatus(valid=False, message="등록되지 않았거나 만료된 라이선스입니다.")

    daily_used, monthly_used = _get_usage(key)
    return LicenseStatus(
        valid=True,
        remaining_days=remaining,
        expires=lic["expires_at"],
        plan=lic["plan"],
        plan_label=plan_label(lic["plan"]),
        daily_used=daily_used,
        daily_limit=lic["daily_limit"],
        monthly_used=monthly_used,
        monthly_limit=lic["monthly_limit"],
        started_at=str(lic.get("started_at") or ""),
        duration_days=int(lic.get("duration_days") or 0),
    )


def check_quota(license_key: str, need: int = 1) -> LicenseStatus:
    need = max(1, int(need))
    status = check_license(license_key)
    if not status.valid:
        return status

    if status.daily_used + need > status.daily_limit:
        return LicenseStatus(
            valid=False,
            message=(
                f"오늘 생성 한도({status.daily_limit}장)가 부족합니다. "
                f"남은 일 한도: {max(0, status.daily_limit - status.daily_used)}장"
            ),
            remaining_days=status.remaining_days,
            expires=status.expires,
            plan=status.plan,
            plan_label=status.plan_label,
            daily_used=status.daily_used,
            daily_limit=status.daily_limit,
            monthly_used=status.monthly_used,
            monthly_limit=status.monthly_limit,
            started_at=status.started_at,
            duration_days=status.duration_days,
        )

    if status.monthly_used + need > status.monthly_limit:
        return LicenseStatus(
            valid=False,
            message=(
                f"이번 달 생성 한도({status.monthly_limit}장)가 부족합니다. "
                f"남은 월 한도: {max(0, status.monthly_limit - status.monthly_used)}장"
            ),
            remaining_days=status.remaining_days,
            expires=status.expires,
            plan=status.plan,
            plan_label=status.plan_label,
            daily_used=status.daily_used,
            daily_limit=status.daily_limit,
            monthly_used=status.monthly_used,
            monthly_limit=status.monthly_limit,
            started_at=status.started_at,
            duration_days=status.duration_days,
        )

    return status


def increment_usage(license_key: str, count: int = 1) -> None:
    count = max(1, int(count))
    key = license_key.strip().upper()
    today = today_kst().isoformat()
    ym = year_month_kst()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO usage_daily (license_key, date, count)
            VALUES (?, ?, ?)
            ON CONFLICT(license_key, date) DO UPDATE SET count = count + ?
            """,
            (key, today, count, count),
        )
        conn.execute(
            """
            INSERT INTO usage_monthly (license_key, year_month, count)
            VALUES (?, ?, ?)
            ON CONFLICT(license_key, year_month) DO UPDATE SET count = count + ?
            """,
            (key, ym, count, count),
        )


def log_request(
    license_key: str,
    endpoint: str,
    model: Optional[str] = None,
    success: bool = True,
) -> None:
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO request_logs (license_key, endpoint, model, success)
            VALUES (?, ?, ?, ?)
            """,
            (license_key.strip().upper(), endpoint, model, 1 if success else 0),
        )


def create_license(
    plan: str,
    days: int = 0,
    months: int = 0,
    license_key: Optional[str] = None,
    note: Optional[str] = None,
    daily_limit: Optional[int] = None,
    monthly_limit: Optional[int] = None,
) -> dict:
    if plan not in PLAN_DEFAULTS:
        raise ValueError(f"Unknown plan: {plan}. Use: {', '.join(PLAN_DEFAULTS)}")

    if days <= 0 and months <= 0:
        raise ValueError("days or months must be positive")

    total_days = days + months * 30
    defaults = PLAN_DEFAULTS[plan]
    key = (license_key or generate_license_key()).strip().upper()

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO licenses (
                license_key, plan, expires_at, daily_limit, monthly_limit, note,
                duration_days, started_at
            ) VALUES (?, ?, '2099-12-31', ?, ?, ?, ?, NULL)
            """,
            (
                key,
                plan,
                daily_limit if daily_limit is not None else defaults["daily_limit"],
                monthly_limit if monthly_limit is not None else defaults["monthly_limit"],
                note,
                total_days,
            ),
        )

    lic = get_license(key)
    _persist_vault()
    return lic


def extend_license(license_key: str, days: int) -> dict:
    key = license_key.strip().upper()
    lic = get_license(key)
    if not lic:
        raise ValueError(f"License not found: {key}")

    with get_db() as conn:
        if not lic.get("started_at"):
            duration = int(lic.get("duration_days") or 0) + days
            conn.execute(
                """
                UPDATE licenses
                SET duration_days = ?, status = 'active', updated_at = datetime('now')
                WHERE license_key = ?
                """,
                (duration, key),
            )
        else:
            current_expire = _parse_date(lic["expires_at"])
            base = max(current_expire, today_kst())
            new_expire = (base + timedelta(days=days)).isoformat()
            conn.execute(
                """
                UPDATE licenses
                SET expires_at = ?, status = 'active', updated_at = datetime('now')
                WHERE license_key = ?
                """,
                (new_expire, key),
            )

    lic = get_license(key)
    _persist_vault()
    return lic


def suspend_license(license_key: str) -> dict:
    key = license_key.strip().upper()
    lic = get_license(key)
    if not lic:
        raise ValueError(f"License not found: {key}")
    with get_db() as conn:
        conn.execute(
            """
            UPDATE licenses
            SET status = 'suspended', updated_at = datetime('now')
            WHERE license_key = ?
            """,
            (key,),
        )
    lic = get_license(key)
    _persist_vault()
    return lic


def activate_license(license_key: str) -> dict:
    key = license_key.strip().upper()
    lic = get_license(key)
    if not lic:
        raise ValueError(f"License not found: {key}")
    with get_db() as conn:
        conn.execute(
            """
            UPDATE licenses
            SET status = 'active', updated_at = datetime('now')
            WHERE license_key = ?
            """,
            (key,),
        )
    lic = get_license(key)
    _persist_vault()
    return lic


def delete_license(license_key: str) -> dict:
    """Soft-delete: keep the row so it can be reviewed in the deleted list."""
    key = license_key.strip().upper()
    if key == ADMIN_TEST_KEY:
        raise ValueError("관리자 테스트 키는 삭제할 수 없습니다.")
    lic = get_license(key)
    if not lic:
        raise ValueError(f"License not found: {key}")
    if lic.get("status") == "deleted":
        return lic
    with get_db() as conn:
        conn.execute(
            """
            UPDATE licenses
            SET status = 'deleted', updated_at = datetime('now')
            WHERE license_key = ?
            """,
            (key,),
        )
    lic = get_license(key)
    _persist_vault()
    return lic


def restore_license(license_key: str) -> dict:
    """Restore a soft-deleted license to active."""
    key = license_key.strip().upper()
    lic = get_license(key)
    if not lic:
        raise ValueError(f"License not found: {key}")
    if lic.get("status") != "deleted":
        return lic
    with get_db() as conn:
        conn.execute(
            """
            UPDATE licenses
            SET status = 'active', updated_at = datetime('now')
            WHERE license_key = ?
            """,
            (key,),
        )
    lic = get_license(key)
    _persist_vault()
    return lic


def set_note(license_key: str, note: str) -> dict:
    key = license_key.strip().upper()
    lic = get_license(key)
    if not lic:
        raise ValueError(f"License not found: {key}")
    with get_db() as conn:
        conn.execute(
            """
            UPDATE licenses
            SET note = ?, updated_at = datetime('now')
            WHERE license_key = ?
            """,
            (note.strip(), key),
        )
    lic = get_license(key)
    _persist_vault()
    return lic


def list_licenses(*, include_deleted: bool = False, deleted_only: bool = False) -> list[dict]:
    with get_db() as conn:
        if deleted_only:
            rows = conn.execute(
                "SELECT * FROM licenses WHERE status = 'deleted' ORDER BY updated_at DESC"
            ).fetchall()
        elif include_deleted:
            rows = conn.execute("SELECT * FROM licenses ORDER BY created_at DESC").fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM licenses WHERE status != 'deleted' ORDER BY created_at DESC"
            ).fetchall()
    out = []
    for r in rows:
        item = dict(r)
        daily_used, monthly_used = _get_usage(item["license_key"])
        item["daily_used"] = daily_used
        item["monthly_used"] = monthly_used
        item["plan_label"] = plan_label(item.get("plan") or "")
        out.append(item)
    return out


def count_deleted_licenses() -> int:
    with get_db() as conn:
        row = conn.execute(
            "SELECT COUNT(*) AS n FROM licenses WHERE status = 'deleted'"
        ).fetchone()
    return int(row["n"] if row else 0)


def sync_plan_limits() -> int:
    """Align stored daily/monthly limits with current PLAN_DEFAULTS for each plan."""
    updated = 0
    with get_db() as conn:
        for plan, defaults in PLAN_DEFAULTS.items():
            cur = conn.execute(
                """
                UPDATE licenses
                SET daily_limit = ?,
                    monthly_limit = ?,
                    updated_at = datetime('now')
                WHERE plan = ?
                  AND (daily_limit != ? OR monthly_limit != ?)
                """,
                (
                    defaults["daily_limit"],
                    defaults["monthly_limit"],
                    plan,
                    defaults["daily_limit"],
                    defaults["monthly_limit"],
                ),
            )
            updated += cur.rowcount or 0
    if updated:
        _persist_vault()
    return updated


def seed_admin_test_key() -> None:
    existing = get_license(ADMIN_TEST_KEY)
    defaults = PLAN_DEFAULTS["admin_test"]
    if existing:
        with get_db() as conn:
            conn.execute(
                """
                UPDATE licenses
                SET plan = 'admin_test',
                    daily_limit = ?,
                    monthly_limit = ?,
                    status = 'active',
                    expires_at = '2099-12-31',
                    updated_at = datetime('now')
                WHERE license_key = ?
                """,
                (defaults["daily_limit"], defaults["monthly_limit"], ADMIN_TEST_KEY),
            )
        _persist_vault()
        return

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO licenses (
                license_key, plan, expires_at, daily_limit, monthly_limit, note,
                duration_days, started_at, status
            ) VALUES (?, 'admin_test', '2099-12-31', ?, ?, ?, 0, ?, 'active')
            """,
            (
                ADMIN_TEST_KEY,
                defaults["daily_limit"],
                defaults["monthly_limit"],
                "관리자 테스트 고정 키",
                today_kst().isoformat(),
            ),
        )
    _persist_vault()
