import { t } from '@/i18n';
import { Locale } from '@/types';

/** Detect OpenAI / Google safety / content-policy errors. */
export function isSafetyViolationMessage(message: string): boolean {
  const lower = message.toLowerCase().replace(/\s+/g, ' ');
  return (
    lower.includes('safety_violations') ||
    lower.includes('safety system') ||
    lower.includes('safety filter') ||
    lower.includes('rejected by the safety') ||
    lower.includes('content_policy') ||
    lower.includes('content policy') ||
    lower.includes('content filters') ||
    lower.includes('moderation') ||
    lower.includes('responsibleaipolicy') ||
    lower.includes('rejected as potentially') ||
    lower.includes('sexual content') ||
    lower.includes('violent content') ||
    (lower.includes('help.openai.com') && lower.includes('safety')) ||
    (lower.includes('prohibited') && lower.includes('content')) ||
    lower.includes('안전 가이드라인에 위배')
  );
}

export function isInvalidApiKeyMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('api key not valid') ||
    lower.includes('invalid api key') ||
    lower.includes('incorrect api key') ||
    lower.includes('gemini_api_key') ||
    lower.includes('aiza') ||
    lower.includes('google/gemini api') ||
    lower.includes('openai api 키') ||
    lower.includes('render의 gemini')
  );
}

/** Map raw API errors to user-facing locale text when we recognize them. */
export function localizeApiError(message: string, locale: Locale): string {
  const trimmed = message.trim();
  if (!trimmed) return t(locale, 'toast.unknown');
  if (isSafetyViolationMessage(trimmed)) {
    return t(locale, 'toast.safetyViolation');
  }
  if (isInvalidApiKeyMessage(trimmed)) {
    if (/google|gemini|aiza|aq\.|render의 gemini/i.test(trimmed)) {
      return t(locale, 'toast.invalidGeminiKey');
    }
    return t(locale, 'toast.invalidApiKey');
  }
  return trimmed;
}
