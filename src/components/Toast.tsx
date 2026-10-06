import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ToastMessage } from '@/types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const styleMap = {
  error: 'border-rose-500/40 bg-rose-950/90 text-rose-100',
  success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
  info: 'border-accent-border bg-surface-raised text-accent',
};

export function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 right-3 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg backdrop-blur animate-fade-in ${styleMap[toast.type]}`}
            role="alert"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded p-0.5 opacity-70 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
