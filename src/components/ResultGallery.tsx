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
  onDeleteResultItem: (id: string) => void;
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
  onDeleteResultItem,
  onDeleteHistoryItem,
  onClearHistory,
}: ResultGalleryProps) {
  const emptyResults = !loading && results.length === 0;

  return (
    <section className="flex min-h-[280px] flex-1 flex-col px-3 pb-3 pt-2 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-2 min-[420px]:hidden">
        <div className="flex rounded-[10px] border border-accent-border bg-surface-banner p-0.5">
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

      <div className="flex min-h-0 flex-1 gap-3">
        {/* Main results — always on wider screens; tabbed on narrow */}
        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto ${
            tab === 'history' ? 'hidden min-[420px]:block' : 'block'
          }`}
        >
          <div className="mb-2 hidden items-center gap-1.5 text-xs font-medium text-zinc-400 min-[420px]:flex">
            <Images className="h-3.5 w-3.5 text-accent" />
            {t(locale, 'gallery.results')}
            {results.length > 0 && (
              <span className="rounded bg-surface-overlay px-1.5 py-px text-[10px] text-zinc-500">
                {results.length}
              </span>
            )}
          </div>

          {emptyResults ? (
            <EmptyState
              title={t(locale, 'gallery.emptyResults')}
              hint={t(locale, 'gallery.emptyResultsHint')}
            />
          ) : (
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
              {loading &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="overflow-hidden rounded-xl ring-1 ring-surface-border"
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    <div className="skeleton h-full w-full" />
                  </div>
                ))}

              {!loading &&
                results.map((logo) => (
                  <LogoCard
                    key={logo.id}
                    logo={logo}
                    variant="main"
                    onToast={onToast}
                    onDelete={onDeleteResultItem}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Narrow: history tab body */}
        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto min-[420px]:hidden ${
            tab === 'history' ? 'block' : 'hidden'
          }`}
        >
          {history.length === 0 ? (
            <EmptyState
              title={t(locale, 'gallery.emptyHistory')}
              hint={t(locale, 'gallery.emptyHistoryHint')}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {history.map((logo) => (
                <LogoCard
                  key={logo.id}
                  logo={logo}
                  variant="main"
                  onToast={onToast}
                  onDelete={onDeleteHistoryItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right history rail */}
        <aside className="hidden w-[108px] shrink-0 flex-col border-l border-surface-border pl-2 min-[420px]:flex sm:w-[120px]">
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
              <History className="h-3 w-3 text-accent" />
              {t(locale, 'gallery.history')}
              {history.length > 0 && (
                <span className="text-[10px] font-normal text-zinc-600">
                  {history.length}
                </span>
              )}
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                title={t(locale, 'gallery.clearAll')}
                aria-label={t(locale, 'gallery.clearAll')}
                className="rounded p-0.5 text-zinc-600 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-1">
            {history.length === 0 ? (
              <p className="px-0.5 text-[10px] leading-relaxed text-zinc-600">
                {t(locale, 'gallery.emptyHistoryHint')}
              </p>
            ) : (
              history.map((logo) => (
                <LogoCard
                  key={logo.id}
                  logo={logo}
                  variant="thumb"
                  onToast={onToast}
                  onDelete={onDeleteHistoryItem}
                />
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-zinc-600 ring-1 ring-surface-border">
        <ImageOff className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      <p className="max-w-[240px] text-xs leading-relaxed text-zinc-500">{hint}</p>
    </div>
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
          ? 'bg-accent-deep text-[#0c0a09]'
          : 'text-ink-muted hover:text-accent'
      }`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span
          className={`rounded px-1 py-px text-[10px] ${
            active ? 'bg-[#0c0a09]/20 text-[#0c0a09]' : 'bg-surface-overlay text-zinc-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
