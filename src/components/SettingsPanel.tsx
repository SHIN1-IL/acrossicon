import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { AiProvider, AppSettings, Locale } from '@/types';
import { maskApiKey } from '@/lib/storage';
import { t } from '@/i18n';

interface SettingsPanelProps {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  /** Web app uses same-origin API — hide server URL field. */
  hideApiBaseUrl?: boolean;
}

export function SettingsPanel({
  open,
  settings,
  onClose,
  onSave,
  hideApiBaseUrl = false,
}: SettingsPanelProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const locale = draft.locale;

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setShowKey(false);
    }
  }, [open, settings]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // Password autofill often skips React onChange — read DOM value on save.
      const typedKey = (apiKeyRef.current?.value ?? draft.apiKey).trim();
      // Empty field keeps the previously saved key (common “dots look filled” case).
      const apiKey = typedKey || settings.apiKey.trim();
      const next: AppSettings = {
        ...draft,
        apiKey,
        licenseKey: draft.licenseKey.trim().toUpperCase(),
        apiBaseUrl: draft.apiBaseUrl.trim(),
      };
      await onSave(next);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50 animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close settings backdrop"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-[360px] min-w-[280px] flex-col border-l border-surface-border bg-surface-raised shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              {t(locale, 'settings.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-surface-overlay hover:text-zinc-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'settings.language')}
            </span>
            <select
              value={draft.locale}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  locale: e.target.value as Locale,
                }))
              }
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/60"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'settings.provider')}
            </span>
            <select
              value={draft.provider}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, provider: e.target.value as AiProvider }))
              }
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/60"
            >
              <option value="openai">OpenAI (gpt-image-1)</option>
              <option value="google">Google (Imagen 3)</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'settings.apiKey')}
            </span>
            <div className="relative">
              <input
                ref={apiKeyRef}
                type={showKey ? 'text' : 'password'}
                value={draft.apiKey}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                onInput={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    apiKey: (e.target as HTMLInputElement).value,
                  }))
                }
                placeholder={
                  settings.apiKey
                    ? t(locale, 'settings.apiKeyKeepPlaceholder')
                    : draft.provider === 'openai'
                      ? 'sk-...'
                      : 'AIza...'
                }
                autoComplete="new-password"
                name="acrossicon-openai-key"
                spellCheck={false}
                className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 pr-10 font-mono text-sm text-zinc-100 outline-none focus:border-sky-500/60"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-300"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {settings.apiKey && (
              <p className="text-[11px] text-zinc-500">
                {t(locale, 'settings.saved')}:{' '}
                <span className="font-mono">{maskApiKey(settings.apiKey)}</span>
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-zinc-500">
              {t(locale, 'settings.keyHint')}
            </p>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'settings.licenseKey')}
            </span>
            <input
              type="text"
              value={draft.licenseKey}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  licenseKey: e.target.value.trim().toUpperCase(),
                }))
              }
              placeholder={t(locale, 'settings.licenseKeyPlaceholder')}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 font-mono text-sm uppercase tracking-wide text-zinc-100 outline-none focus:border-sky-500/60"
            />
            <p className="text-[11px] leading-relaxed text-zinc-500">
              {t(locale, 'settings.licenseHint')}
            </p>
          </label>

          {!hideApiBaseUrl && (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-400">
                {t(locale, 'settings.apiBaseUrl')}
              </span>
              <input
                type="url"
                value={draft.apiBaseUrl}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, apiBaseUrl: e.target.value.trim() }))
                }
                placeholder="https://acrossicon.onrender.com"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 font-mono text-xs text-zinc-100 outline-none focus:border-sky-500/60"
              />
              <p className="text-[11px] leading-relaxed text-zinc-500">
                {t(locale, 'settings.apiBaseUrlHint')}
              </p>
            </label>
          )}

          <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-surface-border bg-surface px-3 py-3">
            <div>
              <span className="text-xs font-medium text-zinc-300">
                {t(locale, 'settings.variation')}
              </span>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                {t(locale, 'settings.variationHint')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={draft.promptVariation}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, promptVariation: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 accent-sky-500"
            />
          </label>
        </div>

        <div className="border-t border-surface-border p-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {saving ? t(locale, 'settings.saving') : t(locale, 'settings.save')}
          </button>
        </div>
      </aside>
    </div>
  );
}
