/**
 * Backend base URL for license / quota / web generate APIs.
 * Extension default: Render production.
 * Web app: same origin when apiBaseUrl is empty.
 */
export const DEFAULT_API_BASE_URL = 'https://acrossicon.onrender.com';

export function isExtensionRuntime(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
}

export function isWebRuntime(): boolean {
  return typeof window !== 'undefined' && !isExtensionRuntime();
}

export function normalizeApiBase(url: string | undefined): string {
  const raw = (url || '').trim().replace(/\/+$/, '');
  if (raw) return raw;
  if (isWebRuntime() && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_API_BASE_URL;
}
