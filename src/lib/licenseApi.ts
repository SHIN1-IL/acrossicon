import { normalizeApiBase } from '@/lib/config';

export interface LicenseQuota {
  valid: boolean;
  message: string;
  remaining_days: number;
  expires: string;
  plan: string;
  plan_label: string;
  daily_used: number;
  daily_limit: number;
  monthly_used: number;
  monthly_limit: number;
  started_at: string;
  duration_days: number;
}

export class LicenseApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'LicenseApiError';
  }
}

async function postLicense(
  apiBase: string,
  path: string,
  licenseKey: string,
  extra: Record<string, number> = {},
): Promise<LicenseQuota> {
  const base = normalizeApiBase(apiBase);
  const key = licenseKey.trim().toUpperCase();
  if (!key) {
    throw new LicenseApiError('라이선스 키를 입력해 주세요.');
  }

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: key, ...extra }),
    });
  } catch {
    throw new LicenseApiError(
      '라이선스 서버에 연결할 수 없습니다. 서버 주소·네트워크를 확인해 주세요.',
    );
  }

  const data = (await res.json().catch(() => ({}))) as
    | LicenseQuota
    | { detail?: string | { msg?: string }[] };

  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String(d.msg) : String(d))).join(', ')
          : `라이선스 오류 (${res.status})`;
    throw new LicenseApiError(message, res.status);
  }

  return data as LicenseQuota;
}

export async function fetchLicenseStatus(
  apiBase: string,
  licenseKey: string,
): Promise<LicenseQuota> {
  return postLicense(apiBase, '/api/license/status', licenseKey, { need: 1 });
}

export async function checkLicenseQuota(
  apiBase: string,
  licenseKey: string,
  need: number,
): Promise<LicenseQuota> {
  return postLicense(apiBase, '/api/license/check', licenseKey, {
    need: Math.min(Math.max(need, 1), 4),
  });
}

export async function consumeLicenseQuota(
  apiBase: string,
  licenseKey: string,
  count: number,
): Promise<LicenseQuota> {
  return postLicense(apiBase, '/api/license/consume', licenseKey, {
    count: Math.min(Math.max(count, 1), 4),
  });
}

export function formatQuota(q: LicenseQuota | null): string {
  if (!q) return '';
  const dailyLeft = Math.max(0, q.daily_limit - q.daily_used);
  const monthlyLeft = Math.max(0, q.monthly_limit - q.monthly_used);
  return `오늘 ${dailyLeft}/${q.daily_limit} · 이번달 ${monthlyLeft}/${q.monthly_limit}`;
}
