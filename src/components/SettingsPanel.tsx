import { useEffect, useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import { LegalFoot } from '@/components/LegalFoot';
import { SubscriptionGuide } from '@/components/SubscriptionGuide';
import { AppSettings, FONT_SIZES, FontSize, Locale } from '@/types';
import { t } from '@/i18n';

interface SettingsPanelProps {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  /** Same-origin web app — hide license server URL. */
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
  const [saving, setSaving] = useState(false);
  const locale = draft.locale;

  useEffect(() => {
    if (open) {
      setDraft(settings);
    }
  }, [open, settings]);

  // Live-preview font size while the panel is open
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.fontSize = draft.fontSize;
    return () => {
      document.documentElement.dataset.fontSize = settings.fontSize;
    };
  }, [open, draft.fontSize, settings.fontSize]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const next: AppSettings = {
        ...draft,
        provider: 'openai',
        apiKey: '',
        licenseKey: draft.licenseKey.trim().toUpperCase(),
        apiBaseUrl: draft.apiBaseUrl.trim(),
      };
      await onSave(next);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const setFontSize = (fontSize: FontSize) => {
    setDraft((prev) => ({ ...prev, fontSize }));
  };

  const licenseHintKey = (() => {
    const k = draft.licenseKey.trim().toUpperCase();
    if (k === 'ADMIN-GEMINI') return 'settings.licenseHintAdminGemini' as const;
    if (k === 'ADMIN-TEST') return 'settings.licenseHintAdminTest' as const;
    return 'settings.licenseHint' as const;
  })();

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
            <KeyRound className="h-4 w-4 text-accent" />
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
              className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent-border"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>

          <div className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'settings.fontSize')}
            </span>
            <div
              className="flex rounded-[10px] border border-accent-border bg-surface-banner p-0.5"
              role="group"
              aria-label={t(locale, 'settings.fontSize')}
            >
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`flex-1 rounded-md px-2 py-2 text-[11px] font-semibold transition ${
                    draft.fontSize === size
                      ? 'bg-accent-deep text-[#0c0a09]'
                      : 'text-ink-muted hover:text-accent'
                  }`}
                >
                  {t(locale, `settings.fontSize.${size}`)}
                </button>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              {t(locale, 'settings.fontSizeHint')}
            </p>
          </div>

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
              className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 font-mono text-sm uppercase tracking-wide text-zinc-100 outline-none focus:border-accent-border"
            />
            <p className="text-[11px] leading-relaxed text-zinc-500">
              {t(locale, licenseHintKey)}
            </p>
          </label>

          <SubscriptionGuide locale={locale} />

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
                className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 font-mono text-xs text-zinc-100 outline-none focus:border-accent-border"
              />
              <p className="text-[11px] leading-relaxed text-zinc-500">
                {t(locale, 'settings.apiBaseUrlHint')}
              </p>
            </label>
          )}

          <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-surface-border bg-surface-overlay px-3 py-3">
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
              className="mt-0.5 h-4 w-4 accent-[#0ea5e9]"
            />
          </label>
        </div>

        <div className="border-t border-surface-border p-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-accent-deep px-4 py-2.5 text-sm font-bold text-[#0c0a09] transition hover:bg-accent disabled:opacity-50"
          >
            {saving ? t(locale, 'settings.saving') : t(locale, 'settings.save')}
          </button>
          <LegalFoot locale={locale} className="mt-3" />
        </div>
      </aside>
    </div>
  );
}
