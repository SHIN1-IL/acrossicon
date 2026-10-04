import {
  ColorTheme,
  CreatorFormValues,
  LogoLayout,
  LogoShape,
  ReinterpretStrength,
  TextPlacement,
} from '@/types';

const COLOR_PALETTE_MAP: Record<Exclude<ColorTheme, 'Custom'>, string> = {
  Monochrome: 'black, white, and subtle gray tones',
  'Neon Accent': 'deep charcoal base with vivid neon accent highlights',
  'Ocean Blue': 'ocean blues, teal, and crisp white',
  'Earth Tone': 'warm earth tones — terracotta, olive, sand, and charcoal',
};

const LAYOUT_DIRECTIVES: Record<LogoLayout, string> = {
  icon: "Icon-only logo mark: abstract symbol or emblem only. Do NOT include any letters, words, brand name typography, or readable text. No slogans.",
  icon_text:
    "Combined logo lockup: a distinctive symbol PLUS clean brand-name wordmark reading exactly '{brand}'. Balanced icon+text composition, legible sans-serif lettering, no distorted or misspelled text.",
  wordmark:
    "Wordmark-first logo: typography-led design featuring the brand name '{brand}' as the primary element. Optional tiny supporting mark only if it does not overpower the text. Crisp, readable letters, no gibberish text.",
};

const SHAPE_DIRECTIVES: Record<LogoShape, string> = {
  square:
    'Compose inside a square app-icon / rounded-square frame, centered, suitable as a mobile app icon.',
  circle: 'Compose as a circular badge or round seal mark, fully contained in a circle.',
  horizontal:
    'Horizontal wide lockup layout (landscape orientation), elements arranged left-to-right.',
  vertical:
    'Vertical stacked lockup layout (portrait orientation), elements arranged top-to-bottom.',
  hexagon: 'Contain the mark in a clean hexagonal crest or shield silhouette.',
  free: 'Free-form mark without a forced outer container shape; organic negative space allowed.',
};

const VARIATION_BY_LAYOUT: Record<LogoLayout, readonly string[]> = {
  icon: [
    'Use a bold geometric emblem with strong symmetry and negative space.',
    'Emphasize a single iconic silhouette with ultra-minimal strokes.',
    'Explore interlocking shapes suggesting connection and network.',
    'Prefer an angular hexagonal crest with modern tech sharpness.',
    'Try a soft rounded app-icon style symbol with balanced weight.',
    'Compose a circular badge mark with crisp inner icon detail.',
  ],
  icon_text: [
    'Place the symbol to the left of the wordmark with tight optical balance.',
    'Stack a small icon above the brand name with clear hierarchy.',
    'Use a monogram mark beside the full brand wordmark.',
    'Favor an abstract geometric icon paired with modern sans-serif type.',
    'Keep the icon inside a subtle container and the text outside to the right.',
    'Use high-contrast bold type with a thin-line supporting emblem.',
  ],
  wordmark: [
    'Use a custom geometric sans-serif treatment with unique letterforms.',
    'Emphasize the first letter with a subtle integrated mark.',
    'Apply tight tracking and modern tech typography weight contrast.',
    'Create a minimal monoline wordmark with refined terminals.',
    'Use a bold condensed wordmark suitable for headers and app bars.',
    'Favor elegant wide letter-spacing with strong brand presence.',
  ],
};

const TEXT_PLACEMENT: Record<TextPlacement, string> = {
  left: 'Reserve clean negative space on the LEFT third for website headline overlay. Keep key subjects on the right.',
  right:
    'Reserve clean negative space on the RIGHT third for website headline overlay. Keep key subjects on the left.',
  center:
    'Keep the center relatively open for centered headline overlay; place supporting visuals toward edges.',
  none: 'No text overlay area required; fill the frame with a strong visual composition.',
};

const REINTERPRET: Record<ReinterpretStrength, string> = {
  light:
    'Keep the original subject recognizable; gently restyle lighting, color grade, and polish for a brand website hero.',
  medium:
    'Recompose and restyle clearly for a marketing hero while preserving the core subject idea; adjust object placement and palette.',
  strong:
    'Creatively reinterpret into a fresh original website hero inspired by the source, with new composition, palette, and atmosphere.',
};

export function resolveColorPalette(theme: ColorTheme, customColor?: string): string {
  if (theme === 'Custom') {
    return customColor?.trim() || 'user-defined custom palette';
  }
  return COLOR_PALETTE_MAP[theme];
}

export function collectKeywords(
  values: Pick<CreatorFormValues, 'keywords' | 'customKeyword'>,
): string {
  const custom = values.customKeyword
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const merged = [...new Set([...values.keywords, ...custom])];
  return merged.length > 0 ? merged.join(', ') : 'modern technology';
}

function layoutDirective(layout: LogoLayout, brandName: string): string {
  return LAYOUT_DIRECTIVES[layout].replaceAll('{brand}', brandName);
}

export function buildLogoPrompt(values: CreatorFormValues, variationIndex = 0): string {
  const brandName = values.brandName.trim();
  const keywords = collectKeywords(values);
  const colorTheme = resolveColorPalette(values.colorTheme, values.customColor);
  const layout = values.layout ?? 'icon';
  const shape = values.shape ?? 'square';

  const textRule =
    layout === 'icon'
      ? 'Absolutely no text, letters, numbers, or watermarks in the image.'
      : 'Text must be sharp, correctly spelled, and not distorted.';

  const base = [
    `Professional vector graphic logo for brand named '${brandName}', theme of '${keywords}', color palette '${colorTheme}'.`,
    layoutDirective(layout, brandName),
    SHAPE_DIRECTIVES[shape],
    'Flat minimalist design, modern tech aesthetic, clean geometric lines, high contrast, solid white background, vector emblem style, centered composition, no realistic photos, no complex gradients, ultra-sharp vector aesthetic, 4k resolution.',
    textRule,
  ].join(' ');

  if (variationIndex === 0) return base;
  const variants = VARIATION_BY_LAYOUT[layout];
  const directive = variants[(variationIndex - 1) % variants.length];
  return `${base} Variation ${variationIndex + 1}: ${directive}`;
}

export function buildProductPrompt(
  values: CreatorFormValues,
  variationIndex = 0,
): string {
  const brand = values.brandName.trim() || 'the brand';
  const product = values.productName.trim() || brand;
  const headline = values.productHeadline.trim();
  const points = values.productPoints.trim();
  const keywords = collectKeywords(values);
  const colorTheme = resolveColorPalette(values.colorTheme, values.customColor);

  const textPart = headline
    ? `Include short clean marketing text: headline '${headline}'.${
        points ? ` Supporting bullets or badges: ${points}.` : ''
      } Keep typography sharp and minimal; do not invent long paragraphs.`
    : 'Leave clean space for later text overlay; do not invent long copy.';

  const variations = [
    'Hero product centered with soft studio lighting.',
    'Dynamic angled product shot with bold accent lighting.',
    'Lifestyle context with the product as the clear focal point.',
    'Minimal ecommerce detail card composition on a clean backdrop.',
  ] as const;

  const base = [
    `Professional product marketing banner image for '${product}' by brand '${brand}'.`,
    `Theme '${keywords}', color palette '${colorTheme}'.`,
    'Make the product the visual hero, detailed but clean, modern commercial photography / 3D product render hybrid aesthetic.',
    textPart,
    'High contrast, sharp focus, website-ready, no watermarks, no cluttered UI chrome, 4k quality.',
  ].join(' ');

  if (variationIndex === 0) return base;
  return `${base} Variation ${variationIndex + 1}: ${variations[(variationIndex - 1) % variations.length]}`;
}

export function buildHomePrompt(
  values: CreatorFormValues,
  variationIndex = 0,
): string {
  const brand = values.brandName.trim() || 'the brand';
  const title = values.homeTitle.trim();
  const subtitle = values.homeSubtitle.trim();
  const keywords = collectKeywords(values);
  const colorTheme = resolveColorPalette(values.colorTheme, values.customColor);
  const placement = TEXT_PLACEMENT[values.textPlacement];
  const reinterpret = REINTERPRET[values.reinterpret];

  const textPart =
    values.textPlacement === 'none'
      ? 'Do not render marketing copy in the image.'
      : title
        ? `Optionally include short overlay-ready text '${title}'${
            subtitle ? ` with subtitle '${subtitle}'` : ''
          }. Prefer clean space for HTML text overlay if typography would look imperfect.`
        : 'Prefer empty clean space for website text overlay rather than rendering imperfect letters.';

  const isUpload = values.homeSource === 'upload';
  const sourcePart = isUpload
    ? `Transform the provided free-license reference photo into an original website hero image. ${reinterpret}`
    : 'Create an original website homepage hero / banner image from scratch.';

  const variations = [
    'Cinematic wide hero with depth and soft gradients.',
    'Bright modern startup landing visual with crisp highlights.',
    'Editorial photography mood with strong subject focus.',
    'Abstract tech atmosphere with a clear focal subject.',
  ] as const;

  const base = [
    sourcePart,
    `Brand context '${brand}', theme '${keywords}', color palette '${colorTheme}'.`,
    placement,
    textPart,
    'Website homepage banner aesthetic, high resolution, no watermarks, no stock-photo logos, polished and commercial.',
  ].join(' ');

  if (variationIndex === 0) return base;
  return `${base} Variation ${variationIndex + 1}: ${variations[(variationIndex - 1) % variations.length]}`;
}

/** Builds N prompts for the active generation mode. */
export function buildPromptVariants(
  values: CreatorFormValues,
  count: number,
  vary = true,
): string[] {
  const safeCount = Math.min(Math.max(count, 1), 4);
  const builder =
    values.mode === 'product'
      ? buildProductPrompt
      : values.mode === 'home'
        ? buildHomePrompt
        : buildLogoPrompt;

  if (!vary) {
    const prompt = builder(values, 0);
    return Array.from({ length: safeCount }, () => prompt);
  }
  return Array.from({ length: safeCount }, (_, i) => builder(values, i));
}

/** @deprecated Use buildPromptVariants */
export function buildLogoPromptVariants(
  values: CreatorFormValues,
  count: number,
  vary = true,
): string[] {
  return buildPromptVariants(values, count, vary);
}

export function suggestedImageSizeForShape(
  shape: LogoShape,
): '1024x1024' | '1024x1536' | '1536x1024' {
  if (shape === 'horizontal') return '1536x1024';
  if (shape === 'vertical') return '1024x1536';
  return '1024x1024';
}

export function suggestedImageSizeForMode(
  mode: CreatorFormValues['mode'],
): '1024x1024' | '1024x1536' | '1536x1024' {
  if (mode === 'product') return '1024x1536';
  if (mode === 'home') return '1536x1024';
  return '1024x1024';
}

export function titleForMode(values: CreatorFormValues): string {
  if (values.mode === 'product') {
    return values.productName.trim() || values.brandName.trim() || 'product';
  }
  if (values.mode === 'home') {
    return values.homeTitle.trim() || values.brandName.trim() || 'home';
  }
  return values.brandName.trim() || 'logo';
}
