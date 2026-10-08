import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  ClipboardCopy,
  Download,
  Eraser,
  FileText,
  Trash2,
} from 'lucide-react';
import { GeneratedLogo, ImageSize } from '@/types';
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
  /** main = gallery preview; thumb = history rail */
  variant?: 'main' | 'thumb';
}

function aspectRatioStyle(size?: ImageSize): CSSProperties {
  if (!size) return { aspectRatio: '1 / 1' };
  const [w, h] = size.split('x').map(Number);
  if (!w || !h) return { aspectRatio: '1 / 1' };
  return { aspectRatio: `${w} / ${h}` };
}

export function LogoCard({
  logo,
  onToast,
  onDelete,
  showCheckerboard = false,
  variant = 'main',
}: LogoCardProps) {
  const [busy, setBusy] = useState(false);
  const isThumb = variant === 'thumb';

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

  const save = () =>
    runAction(
      () => downloadPng(logo.url, logo.brandName),
      'PNG 다운로드를 시작했습니다.',
    );

  return (
    <article
      className={`group relative overflow-hidden rounded-xl ring-1 ring-surface-border ${
        isThumb ? 'w-full' : 'w-full max-w-full'
      }`}
    >
      <div
        className={`relative w-full overflow-hidden ${
          showCheckerboard
            ? 'bg-[length:16px_16px] bg-[linear-gradient(45deg,#3f3f46_25%,transparent_25%),linear-gradient(-45deg,#3f3f46_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#3f3f46_75%),linear-gradient(-45deg,transparent_75%,#3f3f46_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-zinc-800'
            : 'bg-zinc-900'
        }`}
        style={aspectRatioStyle(logo.size)}
      >
        <img
          src={logo.url}
          alt={`${logo.brandName} image`}
          className="absolute inset-0 h-full w-full object-contain"
          loading="lazy"
        />
      </div>

      <div
        className={`flex items-center justify-center gap-1 border-t border-surface-border bg-surface-raised/95 p-1.5 ${
          isThumb ? 'flex-col' : 'flex-wrap'
        }`}
      >
        <ActionButton label="저장 (PNG)" disabled={busy} onClick={save} wide={!isThumb}>
          <Download className={isThumb ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          {!isThumb && <span className="text-[11px]">저장</span>}
        </ActionButton>
        {onDelete && (
          <ActionButton
            label="삭제"
            disabled={busy}
            danger
            wide={!isThumb}
            onClick={() => onDelete(logo.id)}
          >
            <Trash2 className={isThumb ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            {!isThumb && <span className="text-[11px]">삭제</span>}
          </ActionButton>
        )}
        {!isThumb && (
          <>
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
          </>
        )}
      </div>
    </article>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  disabled,
  danger,
  wide,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-lg ring-1 backdrop-blur transition disabled:opacity-50 ${
        wide ? 'h-8 px-2.5' : 'h-7 w-7'
      } ${
        danger
          ? 'bg-rose-950/80 text-rose-200 ring-rose-500/30 hover:bg-rose-600 hover:text-white'
          : 'bg-zinc-900/90 text-zinc-100 ring-white/10 hover:bg-accent-deep hover:text-[#0c0a09]'
      }`}
    >
      {children}
    </button>
  );
}
