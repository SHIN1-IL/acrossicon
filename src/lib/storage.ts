import {
  AppSettings,
  DEFAULT_SETTINGS,
  GeneratedLogo,
  normalizeImageSize,
  normalizeLocale,
} from '@/types';

const SETTINGS_KEY = 'acrossmark_settings';
const HISTORY_KEY = 'acrossmark_history';
const MAX_HISTORY = 12;

function isExtensionStorageAvailable(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
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

/** Mask API key for display (keep first 3 + last 4 chars). */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '•'.repeat(apiKey.length);
  return `${apiKey.slice(0, 3)}${'•'.repeat(Math.min(apiKey.length - 7, 20))}${apiKey.slice(-4)}`;
}

export async function loadSettings(): Promise<AppSettings> {
  const stored = await getLocal<Partial<AppSettings>>(SETTINGS_KEY, {});
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    imageSize: normalizeImageSize(stored.imageSize),
    locale: normalizeLocale(stored.locale),
    licenseKey: (stored.licenseKey || '').trim().toUpperCase(),
    apiBaseUrl: (stored.apiBaseUrl || '').trim(),
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setLocal(SETTINGS_KEY, settings);
}

export async function loadHistory(): Promise<GeneratedLogo[]> {
  return getLocal<GeneratedLogo[]>(HISTORY_KEY, []);
}

export async function prependHistory(items: GeneratedLogo[]): Promise<GeneratedLogo[]> {
  const prev = await loadHistory();
  const next = [...items, ...prev].slice(0, MAX_HISTORY);
  await setLocal(HISTORY_KEY, next);
  return next;
}

export async function removeHistoryItem(id: string): Promise<GeneratedLogo[]> {
  const prev = await loadHistory();
  const next = prev.filter((item) => item.id !== id);
  await setLocal(HISTORY_KEY, next);
  return next;
}

export async function clearHistory(): Promise<GeneratedLogo[]> {
  await setLocal(HISTORY_KEY, []);
  return [];
}
