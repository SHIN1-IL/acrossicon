import { idbGet, idbRemove, idbSet } from '@/lib/idbKv';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  GeneratedLogo,
  normalizeFontSize,
  normalizeImageSize,
  normalizeLocale,
} from '@/types';

const SETTINGS_KEY = 'acrossicon_settings';
const HISTORY_KEY = 'acrossicon_history';
const LEGACY_SETTINGS_KEY = 'acrossmark_settings';
const LEGACY_HISTORY_KEY = 'acrossmark_history';
const MAX_HISTORY = 12;

function isExtensionStorageAvailable(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { name?: string; code?: number; message?: string };
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    /quota/i.test(err.message || '')
  );
}

async function getLocal<T>(key: string, fallback: T): Promise<T> {
  if (!isExtensionStorageAvailable()) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  const result = await chrome.storage.local.get(key);
  return (result[key] as T | undefined) ?? fallback;
}

async function setLocal<T>(key: string, value: T): Promise<void> {
  if (!isExtensionStorageAvailable()) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  await chrome.storage.local.set({ [key]: value });
}

async function removeLocal(key: string): Promise<void> {
  if (!isExtensionStorageAvailable()) {
    localStorage.removeItem(key);
    return;
  }
  await chrome.storage.local.remove(key);
}

/** Web history uses IndexedDB (large quota). Extension keeps chrome.storage.local. */
async function readHistoryStore(): Promise<GeneratedLogo[]> {
  if (isExtensionStorageAvailable()) {
    let items = await getLocal<GeneratedLogo[]>(HISTORY_KEY, []);
    if (items.length === 0) {
      const legacy = await getLocal<GeneratedLogo[]>(LEGACY_HISTORY_KEY, []);
      if (legacy.length > 0) {
        items = legacy;
        await setLocal(HISTORY_KEY, legacy);
        await removeLocal(LEGACY_HISTORY_KEY);
      }
    }
    return Array.isArray(items) ? items : [];
  }

  try {
    const fromIdb = await idbGet<GeneratedLogo[]>(HISTORY_KEY);
    if (Array.isArray(fromIdb) && fromIdb.length > 0) {
      return fromIdb;
    }
  } catch {
    // fall through to localStorage migration
  }

  // Migrate legacy localStorage history into IndexedDB once.
  let fromLs = await getLocal<GeneratedLogo[]>(HISTORY_KEY, []);
  if (fromLs.length === 0) {
    fromLs = await getLocal<GeneratedLogo[]>(LEGACY_HISTORY_KEY, []);
  }
  if (fromLs.length > 0) {
    try {
      await idbSet(HISTORY_KEY, fromLs);
      await removeLocal(HISTORY_KEY);
      await removeLocal(LEGACY_HISTORY_KEY);
    } catch {
      // keep readable from localStorage if IDB write fails
    }
    return fromLs;
  }
  return [];
}

async function writeHistoryStore(items: GeneratedLogo[]): Promise<void> {
  if (isExtensionStorageAvailable()) {
    await setLocal(HISTORY_KEY, items);
    return;
  }

  try {
    await idbSet(HISTORY_KEY, items);
    // Free old localStorage slots after a successful IDB write.
    await removeLocal(HISTORY_KEY);
    await removeLocal(LEGACY_HISTORY_KEY);
    return;
  } catch (error) {
    if (!isQuotaError(error)) throw error;
  }

  // Last resort: try smaller localStorage payload (may still fail).
  await setLocal(HISTORY_KEY, items);
}

/** Save history; on quota errors drop oldest items and retry. */
async function writeHistoryWithRetry(items: GeneratedLogo[]): Promise<GeneratedLogo[]> {
  let candidate = items.slice(0, MAX_HISTORY);
  while (candidate.length > 0) {
    try {
      await writeHistoryStore(candidate);
      return candidate;
    } catch (error) {
      if (!isQuotaError(error) || candidate.length <= 1) {
        throw error;
      }
      candidate = candidate.slice(0, Math.max(1, candidate.length - 2));
    }
  }
  try {
    if (isExtensionStorageAvailable()) {
      await setLocal(HISTORY_KEY, []);
    } else {
      await idbRemove(HISTORY_KEY);
      await removeLocal(HISTORY_KEY);
    }
  } catch {
    // ignore cleanup failures
  }
  throw new Error('히스토리 저장 공간이 부족합니다.');
}

/** Mask API key for display (keep first 3 + last 4 chars). */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '•'.repeat(apiKey.length);
  return `${apiKey.slice(0, 3)}${'•'.repeat(Math.min(apiKey.length - 7, 20))}${apiKey.slice(-4)}`;
}

export async function loadSettings(): Promise<AppSettings> {
  let stored = await getLocal<Partial<AppSettings>>(SETTINGS_KEY, {});
  if (!stored.apiKey && !stored.licenseKey) {
    const legacy = await getLocal<Partial<AppSettings>>(LEGACY_SETTINGS_KEY, {});
    if (Object.keys(legacy).length > 0) {
      stored = legacy;
      await setLocal(SETTINGS_KEY, {
        ...DEFAULT_SETTINGS,
        ...legacy,
        imageSize: normalizeImageSize(legacy.imageSize),
        locale: normalizeLocale(legacy.locale),
        fontSize: normalizeFontSize(legacy.fontSize),
        licenseKey: (legacy.licenseKey || '').trim().toUpperCase(),
        apiBaseUrl: (legacy.apiBaseUrl || '').trim(),
      });
      await removeLocal(LEGACY_SETTINGS_KEY);
    }
  }
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    imageSize: normalizeImageSize(stored.imageSize),
    locale: normalizeLocale(stored.locale),
    fontSize: normalizeFontSize(stored.fontSize),
    licenseKey: (stored.licenseKey || '').trim().toUpperCase(),
    apiBaseUrl: (stored.apiBaseUrl || '').trim(),
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setLocal(SETTINGS_KEY, settings);
}

export async function loadHistory(): Promise<GeneratedLogo[]> {
  return readHistoryStore();
}

export async function prependHistory(items: GeneratedLogo[]): Promise<GeneratedLogo[]> {
  const prev = await loadHistory();
  const next = [...items, ...prev].slice(0, MAX_HISTORY);
  return writeHistoryWithRetry(next);
}

export async function removeHistoryItem(id: string): Promise<GeneratedLogo[]> {
  const prev = await loadHistory();
  const next = prev.filter((item) => item.id !== id);
  return writeHistoryWithRetry(next);
}

export async function clearHistory(): Promise<GeneratedLogo[]> {
  if (isExtensionStorageAvailable()) {
    await setLocal(HISTORY_KEY, []);
  } else {
    try {
      await idbSet(HISTORY_KEY, []);
    } catch {
      await idbRemove(HISTORY_KEY).catch(() => undefined);
    }
    await removeLocal(HISTORY_KEY);
    await removeLocal(LEGACY_HISTORY_KEY);
  }
  return [];
}
