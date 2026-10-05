"""라이선스 JSON 금고 — Render 재시작 후에도 키 유지."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from database import get_db

_REPO_VAULT = Path(__file__).parent / "data" / "licenses.vault.json"


def _vault_paths() -> list[Path]:
    paths: list[Path] = []
    extra = os.getenv("LICENSE_VAULT_PATH", "").strip()
    if extra:
        paths.append(Path(extra).expanduser())
    paths.append(Path("/var/data/licenses.vault.json"))
    paths.append(_REPO_VAULT)
    seen: set[str] = set()
    out: list[Path] = []
    for p in paths:
        key = str(p)
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


def _row_to_record(row: Any) -> dict:
    keys = row.keys()
    return {
        "license_key": row["license_key"],
        "plan": row["plan"],
        "expires_at": row["expires_at"],
        "daily_limit": row["daily_limit"],
        "monthly_limit": row["monthly_limit"],
        "status": row["status"],
        "note": row["note"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "started_at": row["started_at"] if "started_at" in keys else None,
        "duration_days": row["duration_days"] if "duration_days" in keys else None,
    }


def dump_licenses() -> list[dict]:
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM licenses ORDER BY created_at ASC").fetchall()
    return [_row_to_record(r) for r in rows]


def _load_file(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    if isinstance(raw, dict):
        items = raw.get("licenses") or []
    elif isinstance(raw, list):
        items = raw
    else:
        return []
    return [i for i in items if isinstance(i, dict) and i.get("license_key")]


def persist_vault() -> None:
    records = dump_licenses()
    payload = json.dumps({"licenses": records}, ensure_ascii=False, indent=2)
    for path in _vault_paths():
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(payload, encoding="utf-8")
        except OSError:
            continue


def upsert_records(records: list[dict]) -> int:
    n = 0
    with get_db() as conn:
        for item in records:
            key = item.get("license_key")
            if not key:
                continue
            conn.execute(
                """
                INSERT INTO licenses (
                    license_key, plan, expires_at, daily_limit, monthly_limit,
                    status, note, created_at, updated_at, started_at, duration_days
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(license_key) DO UPDATE SET
                    plan = excluded.plan,
                    expires_at = excluded.expires_at,
                    daily_limit = excluded.daily_limit,
                    monthly_limit = excluded.monthly_limit,
                    status = excluded.status,
                    note = excluded.note,
                    updated_at = excluded.updated_at,
                    started_at = excluded.started_at,
                    duration_days = excluded.duration_days
                """,
                (
                    key,
                    item.get("plan") or "standard",
                    item.get("expires_at") or "2099-12-31",
                    int(item.get("daily_limit") or 10),
                    int(item.get("monthly_limit") or 60),
                    item.get("status") or "active",
                    item.get("note"),
                    item.get("created_at") or None,
                    item.get("updated_at") or None,
                    item.get("started_at"),
                    item.get("duration_days"),
                ),
            )
            n += 1
    return n


def restore_vault() -> int:
    merged: dict[str, dict] = {}
    for path in _vault_paths():
        for item in _load_file(path):
            key = item["license_key"]
            prev = merged.get(key)
            if not prev or str(item.get("updated_at") or "") >= str(prev.get("updated_at") or ""):
                merged[key] = item
    if not merged:
        return 0
    n = upsert_records(list(merged.values()))
    persist_vault()
    return n
