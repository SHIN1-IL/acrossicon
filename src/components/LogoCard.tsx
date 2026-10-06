import { useState, type ReactNode } from 'react';
import {
  ClipboardCopy,
  Download,
  Eraser,
  FileText,
  Trash2,
} from 'lucide-react';
import { GeneratedLogo } from '@/types';
import { removeWhiteBackground } from '@/lib/bgRemove';
import {
  copyImageToClipboard,
  copyText,
  downloadPng,
} from '@/lib/imageActions';

interface LogoCardProps {
  logo: GeneratedLogo;
  onToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  onDelete?: (id: string) => void;
  showCheckerboard?: boolean;
}

export function LogoCard({
  logo,
  onToast,
  onDelete,
  showCheckerboard = false,
}: LogoCardProps) {
  const [busy, setBusy] = useState(false);

  const runAction = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      onToast(success, 'success');
    } catch (error) {
      onToast(error instanceof Error ? error.message : '작업에 실패했습니다.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-surface-border">
      <div
        className={`absolute inset-0 ${
          showCheckerboard
            ? 'bg-[length:16px_16px] bg-[linear-gradient(45deg,#3f3f46_25%,transparent_25%),linear-gradient(-45deg,#3f3f46_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#3f3f46_75%),linear-gradient(-45deg,transparent_75%,#3f3f46_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-zinc-800'
            : 'bg-white'
        }`}
      />
      <img
        src={logo.url}
        alt={`${logo.brandName} logo`}
        className="relative h-full w-full object-cover"
        loading="lazy"
      />

      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5 p-2">
          <ActionButton
            label="PNG 다운로드"
            disabled={busy}
            onClick={() =>
              runAction(
                () => downloadPng(logo.url, logo.brandName),
                'PNG 다운로드를 시작했습니다.',
              )
            }
          >
            <Download className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton
            label="투명 배경 PNG"
            disabled={busy}
            onClick={() =>
              runAction(async () => {
                const transparent = await removeWhiteBackground(logo.url);
                await downloadPng(transparent, logo.brandName, 'transparent');
              }, '투명 배경 PNG 다운로드를 시작했습니다.')
            }
          >
            <Eraser className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton
            label="클립보드 복사"
            disabled={busy}
            onClick={() =>
              runAction(
                () => copyImageToClipboard(logo.url),
                '이미지가 클립보드에 복사되었습니다.',
              )
            }
          >
            <ClipboardCopy className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton
            label="프롬프트 복사"
            disabled={busy}
            onClick={() =>
              runAction(() => copyText(logo.prompt), '프롬프트를 복사했습니다.')
            }
          >
            <FileText className="h-3.5 w-3.5" />
          </ActionButton>
          {onDelete && (
            <ActionButton
              label="히스토리에서 삭제"
              disabled={busy}
              onClick={() => onDelete(logo.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </ActionButton>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-zinc-200 opacity-0 backdrop-blur transition group-hover:opacity-100">
        {logo.brandName}
      </div>
    </article>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900/90 text-zinc-100 ring-1 ring-white/10 backdrop-blur transition hover:bg-accent-deep hover:text-[#0c0a09] disabled:opacity-50"
    >
      {children}
    </button>
  );
}
