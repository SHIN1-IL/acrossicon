import { AlertTriangle, Wand2, X } from 'lucide-react';
import { Locale } from '@/types';
import { CostEstimate } from '@/lib/costEstimate';
import { t } from '@/i18n';

interface ConfirmGenerateModalProps {
  open: boolean;
  locale: Locale;
  title: string;
  estimate: CostEstimate;
  promptVariation: boolean;
  confirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmGenerateModal({
  open,
  locale,
  title,
  estimate,
  promptVariation,
  confirming,
  onCancel,
  onConfirm,
}: ConfirmGenerateModalProps) {
  if (!open) return null;

  const providerLabel =
    estimate.provider === 'openai' ? 'OpenAI gpt-image-1' : 'Google Imagen 3';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close confirm dialog"
        onClick={onCancel}
        disabled={confirming}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-generate-title"
        className="relative w-full max-w-[320px] rounded-xl border border-surface-border bg-surface-raised p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="confirm-generate-title"
                className="text-sm font-semibold text-zinc-100"
              >
                {t(locale, 'confirm.title')}
              </h2>
              <p className="text-[11px] text-zinc-500">{providerLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-surface-overlay hover:text-zinc-200 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-zinc-400">
          {t(locale, 'confirm.body', {
            title,
            count: estimate.count,
          })}
        </p>

        <div className="mb-4 rounded-lg border border-surface-border bg-surface px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] text-zinc-500">
              {t(locale, 'confirm.cost')}
            </span>
            <span className="text-lg font-semibold tracking-tight text-sky-300">
              {estimate.label}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-600">{estimate.note}</p>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {t(locale, 'confirm.variation')}:{' '}
            <span className={promptVariation ? 'text-sky-300' : 'text-zinc-400'}>
              {promptVariation
                ? t(locale, 'confirm.variationOn')
                : t(locale, 'confirm.variationOff')}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-surface-overlay disabled:opacity-40"
          >
            {t(locale, 'confirm.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-50"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {confirming
              ? t(locale, 'confirm.starting')
              : t(locale, 'confirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
