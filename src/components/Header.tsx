import { Sparkles, Settings } from 'lucide-react';
import { FlipNumber } from '@/components/FlipClock';
import { Locale } from '@/types';
import { t } from '@/i18n';
import type { LicenseQuota } from '@/lib/licenseApi';

interface HeaderProps {
  locale: Locale;
  onOpenSettings: () => void;
  onLocaleChange: (locale: Locale) => void;
  hasApiKey: boolean;
  quota?: LicenseQuota | null;
}

export function Header({
  locale,
  onOpenSettings,
  onLocaleChange,
  hasApiKey,
  quota,
}: HeaderProps) {
  const dailyLeft = quota
    ? Math.max(0, quota.daily_limit - quota.daily_used)
    : null;
  const monthlyLeft = quota
    ? Math.max(0, quota.monthly_limit - quota.monthly_used)
    : null;
  const planLabel = quota?.plan_label || '';

  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-surface-banner px-3 py-2.5 sm:px-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent-border">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-ink sm:text-base">
              AcrossIcon AI
            </h1>
            <p className="truncate text-[11px] text-ink-muted">
              {t(locale, 'app.subtitle')}
            </p>
          </div>
        </div>

        <div className="justify-self-center">
          {quota && dailyLeft !== null && monthlyLeft !== null ? (
            <div
              className="flex flex-col items-center gap-1"
              role="status"
              aria-label={`${planLabel} ${t(locale, 'header.quotaToday')} ${dailyLeft}/${quota.daily_limit} ${t(locale, 'header.quotaMonth')} ${monthlyLeft}/${quota.monthly_limit}`}
            >
              {planLabel ? (
                <span className="rounded-md border border-accent-border bg-accent-soft px-2 py-0.5 text-[11px] font-bold tracking-wide text-accent sm:text-xs">
                  {planLabel}
                </span>
              ) : null}

              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
                <QuotaBlock
                  label={t(locale, 'header.quotaToday')}
                  left={dailyLeft}
                  limit={quota.daily_limit}
                />
                <span className="hidden text-ink-dim sm:inline" aria-hidden>
                  ·
                </span>
                <QuotaBlock
                  label={t(locale, 'header.quotaMonth')}
                  left={monthlyLeft}
                  limit={quota.monthly_limit}
                />
              </div>
            </div>
          ) : (
            <div className="h-8" aria-hidden />
          )}
        </div>

        <div className="flex items-center justify-end gap-1">
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
    </header>
  );
}

function QuotaBlock({
  label,
  left,
  limit,
}: {
  label: string;
  left: number;
  limit: number;
}) {
  const width = Math.max(2, String(limit).length);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted sm:text-xs">
        {label}
      </span>
      <FlipNumber value={left} digits={width} />
      <span className="text-sm font-bold text-ink-dim sm:text-base">/</span>
      <FlipNumber value={limit} digits={width} />
    </div>
  );
}
