import { t } from '@/i18n';
import { Locale } from '@/types';

/** Detect OpenAI / Google safety / content-policy errors. */
export function isSafetyViolationMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('safety_violations') ||
    lower.includes('safety system') ||
    lower.includes('safety filter') ||
    lower.includes('content_policy') ||
    lower.includes('content policy') ||
    lower.includes('content filters') ||
    lower.includes('moderation') ||
    lower.includes('responsibleaipolicy') ||
    lower.includes('rejected as potentially') ||
    lower.includes('sexual content') ||
    lower.includes('violent content') ||
    (lower.includes('prohibited') && lower.includes('content'))
  );
}

/** Map raw API errors to user-facing locale text when we recognize them. */
export function localizeApiError(message: string, locale: Locale): string {
  const trimmed = message.trim();
  if (!trimmed) return t(locale, 'toast.unknown');
  if (isSafetyViolationMessage(trimmed)) {
    return t(locale, 'toast.safetyViolation');
  }
  return trimmed;
}
