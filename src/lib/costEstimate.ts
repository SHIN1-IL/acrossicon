import { AiProvider, GenerationMode, ImageSize } from '@/types';

const OPENAI_GPT_IMAGE_MEDIUM_USD: Record<ImageSize, number> = {
  '1024x1024': 0.04,
  '1024x1536': 0.06,
  '1536x1024': 0.06,
  '2048x1152': 0.08,
};

const GOOGLE_IMAGEN_USD = 0.04;
/** Rough extra cost for feeding a reference image into edits. */
const UPLOAD_EDIT_EXTRA_USD = 0.01;

export interface CostEstimate {
  provider: AiProvider;
  count: number;
  unitUsd: number;
  totalUsd: number;
  label: string;
  note: string;
}

export function estimateGenerationCost(
  provider: AiProvider,
  count: number,
  size: ImageSize,
  options?: {
    mode?: GenerationMode;
    isUploadEdit?: boolean;
    /** Hosted SaaS: customer pays via subscription quota, not their API bill. */
    managed?: boolean;
  },
): CostEstimate {
  const safeCount = Math.min(Math.max(count, 1), 4);
  const isUpload = Boolean(options?.isUploadEdit);

  if (options?.managed) {
    return {
      provider: 'openai',
      count: safeCount,
      unitUsd: 0,
      totalUsd: 0,
      label: `${safeCount}장`,
      note: '구독 한도에서 차감됩니다 (별도 API 키 불필요)',
    };
  }

  if (provider === 'openai') {
    const base = OPENAI_GPT_IMAGE_MEDIUM_USD[size];
    const unitUsd = base + (isUpload ? UPLOAD_EDIT_EXTRA_USD : 0);
    const totalUsd = unitUsd * safeCount;
    const modeLabel =
      options?.mode === 'product'
        ? 'product'
        : options?.mode === 'home'
          ? 'home'
          : 'logo';
    return {
      provider,
      count: safeCount,
      unitUsd,
      totalUsd,
      label: `약 $${totalUsd.toFixed(2)}`,
      note: `${size === '2048x1152' ? 'gpt-image-2' : 'gpt-image-1'} medium · ${modeLabel}${isUpload ? ' edit' : ''} · ${size} · $${unitUsd.toFixed(2)} × ${safeCount}`,
    };
  }

  const totalUsd = GOOGLE_IMAGEN_USD * safeCount;
  return {
    provider,
    count: safeCount,
    unitUsd: GOOGLE_IMAGEN_USD,
    totalUsd,
    label: `약 $${totalUsd.toFixed(2)}`,
    note: `Imagen 3 (추정) · $${GOOGLE_IMAGEN_USD.toFixed(2)} × ${safeCount}`,
  };
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
