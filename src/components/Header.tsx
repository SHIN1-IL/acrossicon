import { Sparkles, Settings } from 'lucide-react';
import { Locale } from '@/types';
import { t } from '@/i18n';

interface HeaderProps {
  locale: Locale;
  onOpenSettings: () => void;
  onLocaleChange: (locale: Locale) => void;
  hasApiKey: boolean;
  quotaLabel?: string;
  planLabel?: string;
}

export function Header({
  locale,
  onOpenSettings,
  onLocaleChange,
  hasApiKey,
  quotaLabel,
  planLabel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-surface-banner px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent-border">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-ink">
              AcrossIcon AI
            </h1>
            <p className="truncate text-[11px] text-ink-muted">
              {t(locale, 'app.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div
            className="flex rounded-md bg-surface-overlay p-0.5 ring-1 ring-surface-border"
            role="group"
            aria-label={t(locale, 'header.language')}
          >
            {([
              { id: 'ko', label: '한' },
              { id: 'en', label: 'EN' },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onLocaleChange(item.id)}
                className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                  locale === item.id
                    ? 'bg-surface-raised text-ink'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="relative rounded-md p-2 text-ink-muted transition hover:bg-surface-overlay hover:text-accent"
            aria-label={t(locale, 'header.settings')}
            title={t(locale, 'header.settings')}
          >
            <Settings className="h-[18px] w-[18px]" />
            {!hasApiKey && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-surface-raised" />
            )}
          </button>
        </div>
      </div>

      {(planLabel || quotaLabel) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {planLabel && (
            <span className="rounded-md border border-accent-border bg-surface-banner px-2 py-0.5 text-[10px] font-semibold text-accent">
              {planLabel}
            </span>
          )}
          {quotaLabel && (
            <span className="text-[10px] text-ink-muted">{quotaLabel}</span>
          )}
        </div>
      )}
    </header>
  );
}
