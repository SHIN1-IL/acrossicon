import { useState, type MouseEvent } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { GeneratedLogo } from '@/types';
import { downloadPng } from '@/lib/imageActions';

interface HistoryThumbProps {
  logo: GeneratedLogo;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToast: (message: string, type?: 'error' | 'success' | 'info') => void;
}

export function HistoryThumb({
  logo,
  selected,
  onSelect,
  onDelete,
  onToast,
}: HistoryThumbProps) {
  const [busy, setBusy] = useState(false);

  const save = async (e: MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    try {
      await downloadPng(logo.url, logo.brandName);
      onToast('PNG 다운로드를 시작했습니다.', 'success');
    } catch (error) {
      onToast(error instanceof Error ? error.message : '저장에 실패했습니다.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete(logo.id);
  };

  return (
    <div
      className={`mx-auto w-full transition-all duration-200 ${
        selected ? 'max-w-[100px] sm:max-w-[112px]' : 'max-w-[72px] sm:max-w-[80px]'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(logo.id)}
        aria-pressed={selected}
        aria-label={`${logo.brandName} 히스토리`}
        className={`relative block w-full overflow-hidden rounded-lg bg-zinc-900 ring-1 transition ${
          selected
            ? 'ring-2 ring-accent shadow-lg shadow-accent/20'
            : 'ring-surface-border hover:ring-accent-border'
        }`}
        style={{ aspectRatio: '1 / 1' }}
      >
        <img
          src={logo.url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      </button>

      {selected && (
        <div className="mt-1.5 flex items-center justify-center gap-1 animate-fade-in">
          <button
            type="button"
            title="저장"
            aria-label="저장"
            disabled={busy}
            onClick={save}
            className="inline-flex h-7 items-center gap-0.5 rounded-md bg-zinc-950/95 px-2 text-[10px] font-semibold text-zinc-50 ring-1 ring-white/20 transition hover:bg-accent-deep hover:text-[#0c0a09] disabled:opacity-50"
          >
            <Download className="h-3 w-3" />
            저장
          </button>
          <button
            type="button"
            title="삭제"
            aria-label="삭제"
            disabled={busy}
            onClick={remove}
            className="inline-flex h-7 items-center gap-0.5 rounded-md bg-rose-600/95 px-2 text-[10px] font-semibold text-white ring-1 ring-rose-300/30 transition hover:bg-rose-500 disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
