export type Locale = 'ko' | 'en';

/** UI text scale — md is the new slightly-larger default. */
export type FontSize = 'sm' | 'md' | 'lg';

export const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg'];

export type AiProvider = 'openai' | 'google';

export type GenerationMode = 'logo' | 'product' | 'home';

export type ImageSource = 'generate' | 'upload';

/** @deprecated Use ImageSource */
export type HomeSource = ImageSource;

export type TextPlacement = 'left' | 'right' | 'center' | 'none';

export type ReinterpretStrength = 'light' | 'medium' | 'strong';

export type ColorTheme =
  | 'Monochrome'
  | 'Neon Accent'
  | 'Ocean Blue'
  | 'Earth Tone'
  | 'Custom';

/** GPT Image sizes (legacy 1792 DALL·E sizes are remapped on load). */
export type ImageSize =
  | '1024x1024'
  | '1024x1536'
  | '1536x1024'
  /** Wide hero 16:9 — uses gpt-image-2 on OpenAI. */
  | '2048x1152';

export interface AppSettings {
  provider: AiProvider;
  apiKey: string;
  imageCount: number;
  imageSize: ImageSize;
  /** Apply distinct prompt directives per candidate for more diversity. */
  promptVariation: boolean;
  /** UI language. Defaults to Korean. */
  locale: Locale;
  /** UI font scale. Defaults to medium (slightly larger than the original). */
  fontSize: FontSize;
  customColor?: string;
  /** AcrossIcon subscription license key (XXXX-XXXX-XXXX). */
  licenseKey: string;
  /** License API base URL (Render / local). */
  apiBaseUrl: string;
}

/** What to include in the mark. */
export type LogoLayout = 'icon' | 'icon_text' | 'wordmark';

/** Outer composition / container shape of the logo. */
export type LogoShape =
  | 'square'
  | 'circle'
  | 'horizontal'
  | 'vertical'
  | 'hexagon'
  | 'free';

export interface CreatorFormValues {
  mode: GenerationMode;
  brandName: string;
  /** English prompt keywords (UI labels are localized separately). */
  keywords: string[];
  /** @deprecated Kept for storage compat; style chips only in UI. */
  customKeyword: string;
  /** Free-form requirements that must be reflected in the image prompt. */
  requirements: string;
  colorTheme: ColorTheme;
  customColor: string;
  layout: LogoLayout;
  shape: LogoShape;
  /** Product banner fields */
  productName: string;
  productHeadline: string;
  productPoints: string;
  /** Home / hero fields */
  homeTitle: string;
  homeSubtitle: string;
  textPlacement: TextPlacement;
  /** Shared: generate from scratch vs edit uploaded reference (all modes). */
  imageSource: ImageSource;
  reinterpret: ReinterpretStrength;
  sourceImageDataUrl: string;
  sourceImageName: string;
  licenseConfirmed: boolean;
}

/** @deprecated Use CreatorFormValues — kept as alias for gradual migration. */
export type LogoFormValues = CreatorFormValues;

export interface GeneratedLogo {
  id: string;
  url: string;
  prompt: string;
  brandName: string;
  createdAt: number;
  mode?: GenerationMode;
}

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'openai',
  apiKey: '',
  imageCount: 1,
  imageSize: '1024x1024',
  promptVariation: true,
  locale: 'ko',
  fontSize: 'md',
  licenseKey: '',
  apiBaseUrl: '',
};

export const IMAGE_COUNTS = [1, 2, 3, 4] as const;

export const IMAGE_SIZES: ImageSize[] = [
  '1024x1024',
  '1024x1536',
  '1536x1024',
  '2048x1152',
];

export const INITIAL_FORM: CreatorFormValues = {
  mode: 'logo',
  brandName: '',
  keywords: ['Minimalist'],
  customKeyword: '',
  requirements: '',
  colorTheme: 'Monochrome',
  customColor: '',
  layout: 'icon',
  shape: 'square',
  productName: '',
  productHeadline: '',
  productPoints: '',
  homeTitle: '',
  homeSubtitle: '',
  textPlacement: 'left',
  imageSource: 'generate',
  reinterpret: 'medium',
  sourceImageDataUrl: '',
  sourceImageName: '',
  licenseConfirmed: false,
};

export const GENERATION_MODES: GenerationMode[] = ['logo', 'product', 'home'];

export const TEXT_PLACEMENTS: TextPlacement[] = [
  'left',
  'right',
  'center',
  'none',
];

export const REINTERPRET_STRENGTHS: ReinterpretStrength[] = [
  'light',
  'medium',
  'strong',
];

/** Stored/prompt values stay English for image model quality. */
export const STYLE_TAGS = [
  'Fintech',
  'Minimalist',
  'Geometric',
  'SaaS',
  'Developer Tool',
  'AI',
  'Startup',
  'Luxury',
] as const;

export const COLOR_THEMES: ColorTheme[] = [
  'Monochrome',
  'Neon Accent',
  'Ocean Blue',
  'Earth Tone',
  'Custom',
];

export const LOGO_LAYOUTS: LogoLayout[] = ['icon', 'icon_text', 'wordmark'];

export const LOGO_SHAPES: LogoShape[] = [
  'square',
  'circle',
  'horizontal',
  'vertical',
  'hexagon',
  'free',
];

export function normalizeLocale(value: string | undefined): Locale {
  return value === 'en' ? 'en' : 'ko';
}

export function normalizeFontSize(value: string | undefined): FontSize {
  return value === 'sm' || value === 'lg' ? value : 'md';
}

/** Normalize legacy DALL·E sizes stored in chrome.storage. */
export function normalizeImageSize(size: string | undefined): ImageSize {
  switch (size) {
    case '1024x1536':
    case '1024x1792':
      return '1024x1536';
    case '1536x1024':
    case '1792x1024':
      return '1536x1024';
    case '2048x1152':
    case '1920x1080':
      return '2048x1152';
    case '1024x1024':
    default:
      return '1024x1024';
  }
}
