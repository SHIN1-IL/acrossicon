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
    <header className="sticky top-0 z-20 border-b border-surface-border/60 bg-surface/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-50">
              AcrossIcon AI
            </h1>
            <p className="truncate text-[11px] text-zinc-500">
              {t(locale, 'app.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div
            className="flex rounded-lg bg-surface-raised p-0.5 ring-1 ring-surface-border"
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
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                  locale === item.id
                    ? 'bg-surface-overlay text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="relative rounded-lg p-2 text-zinc-400 transition hover:bg-surface-overlay hover:text-zinc-100"
            aria-label={t(locale, 'header.settings')}
            title={t(locale, 'header.settings')}
          >
            <Settings className="h-[18px] w-[18px]" />
            {!hasApiKey && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-surface" />
            )}
          </button>
        </div>
      </div>

      {(planLabel || quotaLabel) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {planLabel && (
            <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300 ring-1 ring-sky-500/30">
              {planLabel}
            </span>
          )}
          {quotaLabel && (
            <span className="text-[10px] text-zinc-400">{quotaLabel}</span>
          )}
        </div>
      )}
    </header>
  );
}
