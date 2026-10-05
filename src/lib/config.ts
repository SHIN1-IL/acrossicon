/**
 * Backend base URL for license / quota APIs.
 * Local: run `uvicorn main:app --reload --port 8000` in backend/
 * Prod: set after Render deploy (also add host_permissions in manifest).
 */
export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

export function normalizeApiBase(url: string | undefined): string {
  const raw = (url || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, '');
  return raw;
}
