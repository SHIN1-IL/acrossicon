import { type ReactNode } from 'react';
import { History, ImageOff, Images, Trash2 } from 'lucide-react';
import { GeneratedLogo, Locale } from '@/types';
import { LogoCard } from '@/components/LogoCard';
import { t } from '@/i18n';

export type GalleryTab = 'results' | 'history';

interface ResultGalleryProps {
  locale: Locale;
  tab: GalleryTab;
  onTabChange: (tab: GalleryTab) => void;
  results: GeneratedLogo[];
  history: GeneratedLogo[];
  loading: boolean;
  skeletonCount: number;
  onToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export function ResultGallery({
  locale,
  tab,
  onTabChange,
  results,
  history,
  loading,
  skeletonCount,
  onToast,
  onDeleteHistoryItem,
  onClearHistory,
}: ResultGalleryProps) {
  const logos = tab === 'results' ? results : history;
  const empty =
    !loading &&
    ((tab === 'results' && results.length === 0) ||
      (tab === 'history' && history.length === 0));

  return (
    <section className="flex flex-1 flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex rounded-lg bg-surface-raised p-0.5 ring-1 ring-surface-border">
          <TabButton
            active={tab === 'results'}
            onClick={() => onTabChange('results')}
            icon={<Images className="h-3.5 w-3.5" />}
            label={t(locale, 'gallery.results')}
            count={results.length}
          />
          <TabButton
            active={tab === 'history'}
            onClick={() => onTabChange('history')}
            icon={<History className="h-3.5 w-3.5" />}
            label={t(locale, 'gallery.history')}
            count={history.length}
          />
        </div>

        {tab === 'history' && history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Trash2 className="h-3 w-3" />
            {t(locale, 'gallery.clearAll')}
          </button>
        )}
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-zinc-600 ring-1 ring-surface-border">
            <ImageOff className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-300">
            {tab === 'results'
              ? t(locale, 'gallery.emptyResults')
              : t(locale, 'gallery.emptyHistory')}
          </p>
          <p className="max-w-[240px] text-xs leading-relaxed text-zinc-500">
            {tab === 'results'
              ? t(locale, 'gallery.emptyResultsHint')
              : t(locale, 'gallery.emptyHistoryHint')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          {loading &&
            tab === 'results' &&
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="aspect-square overflow-hidden rounded-xl ring-1 ring-surface-border"
              >
                <div className="skeleton h-full w-full" />
              </div>
            ))}

          {!loading &&
            logos.map((logo) => (
              <LogoCard
                key={logo.id}
                logo={logo}
                onToast={onToast}
                onDelete={
                  tab === 'history'
                    ? (id) => onDeleteHistoryItem(id)
                    : undefined
                }
              />
            ))}
        </div>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition ${
        active
          ? 'bg-surface-overlay text-zinc-100 shadow-sm'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span
          className={`rounded px-1 py-px text-[10px] ${
            active ? 'bg-accent-dim text-accent' : 'bg-surface text-zinc-600'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
