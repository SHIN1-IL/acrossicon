export type Locale = 'ko' | 'en';

export type AiProvider = 'openai' | 'google';

export type GenerationMode = 'logo' | 'product' | 'home';

export type HomeSource = 'generate' | 'upload';

export type TextPlacement = 'left' | 'right' | 'center' | 'none';

export type ReinterpretStrength = 'light' | 'medium' | 'strong';

export type ColorTheme =
  | 'Monochrome'
  | 'Neon Accent'
  | 'Ocean Blue'
  | 'Earth Tone'
  | 'Custom';

/** GPT Image standard sizes (legacy 1792 DALL·E sizes are remapped on load). */
export type ImageSize = '1024x1024' | '1024x1536' | '1536x1024';

export interface AppSettings {
  provider: AiProvider;
  apiKey: string;
  imageCount: number;
  imageSize: ImageSize;
  /** Apply distinct prompt directives per candidate for more diversity. */
  promptVariation: boolean;
  /** UI language. Defaults to Korean. */
  locale: Locale;
  customColor?: string;
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
  customKeyword: string;
  colorTheme: ColorTheme;
  customColor: string;
  layout: LogoLayout;
  shape: LogoShape;
  /** Product banner fields */
  productName: string;
  productHeadline: string;
  productPoints: string;
  /** Home / hero fields */
  homeSource: HomeSource;
  homeTitle: string;
  homeSubtitle: string;
  textPlacement: TextPlacement;
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
  imageCount: 4,
  imageSize: '1024x1024',
  promptVariation: true,
  locale: 'ko',
};

export const INITIAL_FORM: CreatorFormValues = {
  mode: 'logo',
  brandName: '',
  keywords: ['Minimalist'],
  customKeyword: '',
  colorTheme: 'Monochrome',
  customColor: '',
  layout: 'icon',
  shape: 'square',
  productName: '',
  productHeadline: '',
  productPoints: '',
  homeSource: 'generate',
  homeTitle: '',
  homeSubtitle: '',
  textPlacement: 'left',
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

/** Normalize legacy DALL·E sizes stored in chrome.storage. */
export function normalizeImageSize(size: string | undefined): ImageSize {
  switch (size) {
    case '1024x1536':
    case '1024x1792':
      return '1024x1536';
    case '1536x1024':
    case '1792x1024':
      return '1536x1024';
    case '1024x1024':
    default:
      return '1024x1024';
  }
}
