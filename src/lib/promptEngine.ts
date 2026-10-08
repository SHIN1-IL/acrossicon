import {
  ColorTheme,
  CreatorFormValues,
  ImageSize,
  LogoLayout,
  LogoShape,
  ProductFormat,
  PRODUCT_FORMAT_SIZE,
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
    "Combined logo lockup: a distinctive symbol PLUS clean brand-name wordmark reading exactly «{brand}». Balanced icon+text composition; every letter of «{brand}» must be character-perfect (no typos, no gibberish).",
  wordmark:
    "Wordmark-first logo: typography-led design featuring the brand name «{brand}» as the primary element. Optional tiny supporting mark only if it does not overpower the text. Every glyph of «{brand}» must be sharp, correctly spelled, and undistorted.",
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

/** Where to place user-provided hero copy inside the image. */
const TEXT_PLACEMENT: Record<TextPlacement, string> = {
  left: 'Place the headline/subtitle block in the LEFT third. Keep the main visual subject on the right so text stays readable.',
  right:
    'Place the headline/subtitle block in the RIGHT third. Keep the main visual subject on the left so text stays readable.',
  center:
    'Place the headline/subtitle block in the CENTER with clear hierarchy. Keep supporting visuals toward the edges.',
  none: 'Auto-choose the most readable optimal position for the headline/subtitle (usually left or center) with strong contrast against the background.',
};

const PRODUCT_FORMAT_DIRECTIVES: Record<ProductFormat, string> = {
  square:
    'Compose as a square product card (1:1) for marketplace listings and catalog thumbnails — centered hero product, tidy margins, no wasted edge space.',
  portrait:
    'Compose as a tall portrait product banner (2:3) for mobile detail / story-style frames — product dominant vertically, clean top/bottom hierarchy.',
  landscape:
    'Compose as a landscape product banner (3:2) for catalog and detail headers — product hero with side space for copy or accents.',
  wide: 'Compose as a wide 16:9 product hero banner for web — cinematic product staging with horizontal breathing room for headline and supporting copy.',
};

/** Safe-area guidance when the user did NOT provide hero copy. */
const TEXT_SAFE_AREA: Record<TextPlacement, string> = {
  left: 'Keep the LEFT third relatively open for possible later HTML overlay; put the main subject on the right.',
  right:
    'Keep the RIGHT third relatively open for possible later HTML overlay; put the main subject on the left.',
  center:
    'Keep the center relatively open for possible later HTML overlay; put supporting visuals toward the edges.',
  none: 'Fill the frame with a strong visual composition; no text safe-area required.',
};

const HOME_REINTERPRET: Record<ReinterpretStrength, string> = {
  light:
    'Keep the original subject recognizable; gently restyle lighting, color grade, and polish for a brand website hero.',
  medium:
    'Recompose and restyle clearly for a marketing hero while preserving the core subject idea; adjust object placement and palette.',
  strong:
    'Creatively reinterpret into a fresh original website hero inspired by the source, with new composition, palette, and atmosphere.',
};

const LOGO_REINTERPRET: Record<ReinterpretStrength, string> = {
  light:
    'Keep the uploaded mark recognizable; refine into a cleaner professional vector logo with modest polish.',
  medium:
    'Clearly restyle the uploaded reference into a modern vector logo while preserving the core symbol idea.',
  strong:
    'Creatively reinterpret the uploaded reference into a fresh original vector logo inspired by it, with new geometry and composition.',
};

const PRODUCT_REINTERPRET: Record<ReinterpretStrength, string> = {
  light:
    'Keep the uploaded product recognizable; gently improve lighting, background, and commercial polish for a product banner.',
  medium:
    'Restyle and recompose the uploaded product into a strong marketing banner while preserving the product identity.',
  strong:
    'Creatively reinterpret the uploaded product into a fresh commercial banner inspired by it, with new staging and atmosphere.',
};

const NO_TEXT_RULE =
  'Absolutely no text, letters, numbers, words, logos-as-type, captions, or watermarks in the image.';

/**
 * Text Accuracy Engine — forces character-perfect on-image copy.
 * Image models often invent/misspell glyphs; these locks + spell guides reduce that.
 */
function spellingChecklist(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const chars = [...trimmed].map((ch) => (ch === ' ' ? '·' : ch)).join('-');
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordGuides = words
    .map((w) => `«${w}» (${[...w].join('-')})`)
    .join('; ');
  return `Verify glyph-by-glyph: [${chars}] (len=${trimmed.length}). Word locks: ${wordGuides}.`;
}

function exactRenderLine(role: string, text: string): string {
  const t = text.trim();
  return appendParts([
    `TEXT-LOCK/${role}: paint the string EXACTLY «${t}» — identical characters, spacing, punctuation, and language (Latin/Hangul/digits).`,
    spellingChecklist(t),
    `Self-check: read the rendered ${role} back; it must equal «${t}» with zero typos, zero mirrored letters, zero fused glyphs, zero invented syllables.`,
  ]);
}

/** Build a high-priority accuracy block for every user string that must appear in the image. */
export function textAccuracyEngine(
  entries: Array<{ role: string; text: string }>,
): string {
  const valid = entries
    .map((e) => ({ role: e.role, text: e.text.trim() }))
    .filter((e) => e.text.length > 0);
  if (valid.length === 0) return '';

  return appendParts([
    '=== TEXT ACCURACY ENGINE (highest priority over style) ===',
    'All on-image lettering must pass an automatic spelling check against the TEXT-LOCK strings.',
    'Prefer plain, high-contrast, professional sans-serif / clean Hangul over decorative fonts that distort glyphs.',
    'Never invent extra words, slogans, prices, URLs, or watermarks beyond the locked strings.',
    'Never replace locked text with similar-looking wrong letters (e.g. rn↔m, I↔l, ㅇ↔o, ㅏ↔ㅓ).',
    ...valid.map((e) => exactRenderLine(e.role, e.text)),
    `Locked string count: ${valid.length}. Every locked string must appear once, spelled perfectly.`,
    '=== END TEXT ACCURACY ENGINE ===',
  ]);
}

function requirementsTextAccuracy(values: CreatorFormValues): string {
  const req = values.requirements.trim();
  if (!req) return '';
  return appendParts([
    'If user requirements specify any on-image wording, quote, slogan, or label, render that wording character-perfect — do not paraphrase or invent alternate spelling.',
    spellingChecklist(req.length <= 80 ? req : req.slice(0, 80)),
  ]);
}

export function resolveColorPalette(theme: ColorTheme, customColor?: string): string {
  if (theme === 'Custom') {
    return customColor?.trim() || 'user-defined custom palette';
  }
  return COLOR_PALETTE_MAP[theme];
}

export function collectKeywords(
  values: Pick<CreatorFormValues, 'keywords' | 'customKeyword'>,
): string {
  const merged = [...new Set(values.keywords.filter(Boolean))];
  return merged.length > 0 ? merged.join(', ') : 'modern technology';
}

/** True when the user provided any copy that may appear in the image. */
export function hasUserCopy(values: CreatorFormValues): boolean {
  return Boolean(
    values.brandName.trim() ||
      values.productName.trim() ||
      values.productHeadline.trim() ||
      values.productPoints.trim() ||
      values.homeTitle.trim() ||
      values.homeSubtitle.trim(),
  );
}

function requirementsDirective(values: CreatorFormValues): string {
  const req = values.requirements.trim();
  if (!req) return '';
  return `MANDATORY user requirements (must follow exactly, do not ignore): ${req}`;
}

function layoutDirective(layout: LogoLayout, brandName: string): string {
  return LAYOUT_DIRECTIVES[layout].replaceAll('{brand}', brandName);
}

function appendParts(parts: Array<string | false | '' | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function buildLogoPrompt(values: CreatorFormValues, variationIndex = 0): string {
  const brandName = values.brandName.trim();
  const keywords = collectKeywords(values);
  const colorTheme = resolveColorPalette(values.colorTheme, values.customColor);
  const layout = values.layout ?? 'icon';
  const shape = values.shape ?? 'square';
  const allowText = Boolean(brandName) && layout !== 'icon';
  const effectiveLayout: LogoLayout = allowText ? layout : 'icon';
  const isUpload = values.imageSource === 'upload';

  const brandPart = brandName
    ? `Professional vector graphic logo for brand named '${brandName}'`
    : 'Professional vector graphic logo mark for an untitled brand (no name lettering)';

  const sourcePart = isUpload
    ? `Transform the provided reference image into an original professional logo. ${LOGO_REINTERPRET[values.reinterpret]}`
    : 'Create an original professional logo from scratch.';

  const accuracy = allowText
    ? textAccuracyEngine([{ role: 'brand-wordmark', text: brandName }])
    : '';

  const base = appendParts([
    sourcePart,
    `${brandPart}, theme of '${keywords}', color palette '${colorTheme}'.`,
    allowText
      ? layoutDirective(effectiveLayout, brandName)
      : LAYOUT_DIRECTIVES.icon,
    SHAPE_DIRECTIVES[shape],
    'Flat minimalist design, modern tech aesthetic, clean geometric lines, high contrast, solid white background, vector emblem style, centered composition, no realistic photos, no complex gradients, ultra-sharp vector aesthetic, 4k resolution.',
    allowText
      ? appendParts([
          accuracy,
          'Wordmark typography must be sharp, kerned evenly, and character-perfect — regenerate mental proofreading before output.',
        ])
      : NO_TEXT_RULE,
    requirementsDirective(values),
    allowText ? requirementsTextAccuracy(values) : '',
  ]);

  if (variationIndex === 0) return base;
  const variants = VARIATION_BY_LAYOUT[effectiveLayout];
  const directive = variants[(variationIndex - 1) % variants.length];
  return `${base} Variation ${variationIndex + 1}: ${directive}`;
}

export function buildProductPrompt(
  values: CreatorFormValues,
  variationIndex = 0,
): string {
  const brand = values.brandName.trim();
  const product = values.productName.trim();
  const headline = values.productHeadline.trim();
  const points = values.productPoints.trim();
  const keywords = collectKeywords(values);
  const colorTheme = resolveColorPalette(values.colorTheme, values.customColor);
  const isUpload = values.imageSource === 'upload';

  const hasOnImageCopy = Boolean(brand || product || headline || points);

  const textLines: Array<string | false | '' | undefined> = [];
  if (brand) {
    textLines.push(
      `MANDATORY: render the brand / service name EXACTLY as '${brand}' as a clean wordmark or label in a readable optimal position.`,
    );
  } else {
    textLines.push('Do not invent or render any brand name or logo wordmark.');
  }

  if (product) {
    textLines.push(
      `MANDATORY: render the product name EXACTLY as '${product}' on the banner (legible product title / label).`,
    );
  } else {
    textLines.push(
      'Do not invent or render any product name lettering — leave the product unnamed in text.',
    );
  }

  if (headline) {
    textLines.push(
      `MANDATORY: render the marketing headline EXACTLY as '${headline}' (short clean type, strong hierarchy).`,
    );
  } else {
    textLines.push(
      'Do not invent or render a marketing headline, slogan, or CTA line.',
    );
  }

  const pointItems = points
    ? points
        .split(/[\n,|/]+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  if (pointItems.length > 0) {
    textLines.push(
      `MANDATORY: render supporting highlight points EXACTLY as these chips only: ${pointItems
        .map((p) => `«${p}»`)
        .join(', ')} — do not add, merge, or rephrase points.`,
    );
  } else {
    textLines.push(
      'Do not invent or render feature badges, bullet points, price tags, or highlight chips.',
    );
  }

  const accuracyEntries: Array<{ role: string; text: string }> = [];
  if (brand) accuracyEntries.push({ role: 'brand', text: brand });
  if (product) accuracyEntries.push({ role: 'product-name', text: product });
  if (headline) accuracyEntries.push({ role: 'headline', text: headline });
  pointItems.forEach((p, i) =>
    accuracyEntries.push({ role: `highlight-${i + 1}`, text: p }),
  );

  textLines.push(
    hasOnImageCopy
      ? appendParts([
          textAccuracyEngine(accuracyEntries),
          'Compose only the locked user copy with strong contrast and clear hierarchy.',
        ])
      : `${NO_TEXT_RULE} Leave clean space for later text overlay.`,
  );

  const textPart = appendParts(textLines);

  const subjectPart = product
    ? `Focus on a clear product visual for '${product}'.`
    : 'Focus on a clear unnamed product visual (no product-name lettering).';

  const brandContext = brand
    ? `Brand / service context '${brand}'.`
    : 'Untitled brand context (no brand lettering unless provided elsewhere).';

  const sourcePart = isUpload
    ? `Transform the provided reference product/photo into an original product marketing banner. ${PRODUCT_REINTERPRET[values.reinterpret]}`
    : 'Create an original product marketing banner from scratch.';

  const variations = [
    'Hero product centered with soft studio lighting.',
    'Dynamic angled product shot with bold accent lighting.',
    'Lifestyle context with the product as the clear focal point.',
    'Minimal ecommerce detail card composition on a clean backdrop.',
  ] as const;

  const base = appendParts([
    sourcePart,
    'Professional product marketing banner image.',
    PRODUCT_FORMAT_DIRECTIVES[values.productFormat] ||
      PRODUCT_FORMAT_DIRECTIVES.portrait,
    subjectPart,
    brandContext,
    `Theme '${keywords}', color palette '${colorTheme}'.`,
    'Make the product the visual hero, detailed but clean, modern commercial photography / 3D product render hybrid aesthetic.',
    textPart,
    'High contrast, sharp focus, website-ready, no watermarks, no cluttered UI chrome, 4k quality.',
    requirementsDirective(values),
    hasOnImageCopy ? requirementsTextAccuracy(values) : '',
  ]);

  if (variationIndex === 0) return base;
  return `${base} Variation ${variationIndex + 1}: ${variations[(variationIndex - 1) % variations.length]}`;
}

export function buildHomePrompt(
  values: CreatorFormValues,
  variationIndex = 0,
): string {
  const brand = values.brandName.trim();
  const title = values.homeTitle.trim();
  const subtitle = values.homeSubtitle.trim();
  const keywords = collectKeywords(values);
  const colorTheme = resolveColorPalette(values.colorTheme, values.customColor);
  const reinterpret = HOME_REINTERPRET[values.reinterpret];
  const hasOnImageCopy = Boolean(brand || title || subtitle);

  let textPart: string;
  let placementPart: string;

  if (hasOnImageCopy) {
    placementPart = TEXT_PLACEMENT[values.textPlacement];
    const accuracyEntries: Array<{ role: string; text: string }> = [];
    if (brand) accuracyEntries.push({ role: 'brand', text: brand });
    if (title) accuracyEntries.push({ role: 'hero-headline', text: title });
    if (subtitle) accuracyEntries.push({ role: 'hero-subtitle', text: subtitle });

    textPart = appendParts([
      brand
        ? `MANDATORY: render the brand / service name EXACTLY as '${brand}' as a clean wordmark or logo-type in a readable spot (often near the headline block or a subtle corner lockup).`
        : 'Do not invent a brand name or logo wordmark.',
      title
        ? `MANDATORY: render the hero headline EXACTLY as '${title}'.`
        : '',
      subtitle
        ? `MANDATORY: render the supporting subtitle EXACTLY as '${subtitle}' under/near the headline with clear hierarchy (smaller than the headline).`
        : '',
      textAccuracyEngine(accuracyEntries),
      'Compose all locked copy in the most readable optimal position for a website hero: strong contrast, adequate margins, not overlapping busy details.',
      'Do NOT invent extra slogans, CTAs, fake brand names, or any words beyond the brand name / headline / subtitle the user provided.',
    ]);
  } else {
    placementPart = TEXT_SAFE_AREA[values.textPlacement];
    textPart = appendParts([
      NO_TEXT_RULE,
      'Do NOT invent brand names, headlines, subtitles, slogans, CTAs, or any marketing copy.',
    ]);
  }

  const isUpload = values.imageSource === 'upload';
  const sourcePart = isUpload
    ? `Transform the provided free-license reference photo into an original website hero image. ${reinterpret}`
    : 'Create an original website homepage hero / banner image from scratch.';

  const brandPart = brand
    ? `Brand / service '${brand}'`
    : 'Untitled brand (no brand lettering)';

  const variations = [
    'Cinematic wide hero with depth and soft gradients.',
    'Bright modern startup landing visual with crisp highlights.',
    'Editorial photography mood with strong subject focus.',
    'Abstract tech atmosphere with a clear focal subject.',
  ] as const;

  const base = appendParts([
    sourcePart,
    `${brandPart}, theme '${keywords}', color palette '${colorTheme}'.`,
    placementPart,
    textPart,
    'Website homepage banner aesthetic, high resolution, no watermarks, no stock-photo logos, polished and commercial.',
    requirementsDirective(values),
    hasOnImageCopy ? requirementsTextAccuracy(values) : '',
  ]);

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

export function suggestedImageSizeForShape(shape: LogoShape): ImageSize {
  if (shape === 'horizontal') return '1536x1024';
  if (shape === 'vertical') return '1024x1536';
  return '1024x1024';
}

export function sizeForProductFormat(format: ProductFormat): ImageSize {
  return PRODUCT_FORMAT_SIZE[format];
}

export function suggestedImageSizeForMode(
  mode: CreatorFormValues['mode'],
  productFormat: ProductFormat = 'portrait',
): ImageSize {
  if (mode === 'product') return sizeForProductFormat(productFormat);
  if (mode === 'home') return '2048x1152';
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
