import { type ReactNode, useRef } from 'react';
import { ImagePlus, Loader2, Shuffle, Wand2, X } from 'lucide-react';
import {
  AiProvider,
  COLOR_THEMES,
  CreatorFormValues,
  GENERATION_MODES,
  GenerationMode,
  IMAGE_COUNTS,
  IMAGE_SIZES,
  ImageSize,
  LOGO_LAYOUTS,
  LOGO_SHAPES,
  Locale,
  LogoLayout,
  LogoShape,
  PRODUCT_FORMATS,
  ProductFormat,
  REINTERPRET_STRENGTHS,
  STYLE_TAGS,
  TEXT_PLACEMENTS,
  TextPlacement,
  ReinterpretStrength,
} from '@/types';
import {
  colorThemeLabel,
  layoutLabel,
  productFormatLabel,
  shapeLabel,
  styleTagLabel,
  t,
} from '@/i18n';
import {
  buildPromptVariants,
  sizeForProductFormat,
  suggestedImageSizeForMode,
  suggestedImageSizeForShape,
} from '@/lib/promptEngine';

interface InputFormProps {
  locale: Locale;
  provider: AiProvider;
  values: CreatorFormValues;
  loading: boolean;
  hasApiKey: boolean;
  costLabel: string;
  imageCount: number;
  imageSize: ImageSize;
  promptVariation: boolean;
  onPromptVariationChange: (enabled: boolean) => void;
  onImageCountChange: (count: number) => void;
  onImageSizeChange: (size: ImageSize) => void;
  onSuggestImageSize: (size: ImageSize) => void;
  onChange: (values: CreatorFormValues) => void;
  onSubmit: () => void;
  onOpenSettings: () => void;
}

export function InputForm({
  locale,
  provider,
  values,
  loading,
  hasApiKey,
  costLabel,
  imageCount,
  imageSize,
  promptVariation,
  onPromptVariationChange,
  onImageCountChange,
  onImageSizeChange,
  onSuggestImageSize,
  onChange,
  onSubmit,
  onOpenSettings,
}: InputFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    const exists = values.keywords.includes(tag);
    onChange({
      ...values,
      keywords: exists
        ? values.keywords.filter((k) => k !== tag)
        : [...values.keywords, tag],
    });
  };

  const handleModeChange = (mode: GenerationMode) => {
    onChange({ ...values, mode });
    onSuggestImageSize(
      suggestedImageSizeForMode(mode, values.productFormat),
    );
  };

  const handleShapeChange = (shape: LogoShape) => {
    onChange({ ...values, shape });
    onSuggestImageSize(suggestedImageSizeForShape(shape));
  };

  const handleProductFormatChange = (productFormat: ProductFormat) => {
    onChange({ ...values, productFormat });
    onSuggestImageSize(sizeForProductFormat(productFormat));
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...values,
        sourceImageDataUrl: String(reader.result || ''),
        sourceImageName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const canSubmit =
    !loading &&
    (values.imageSource === 'upload'
      ? Boolean(values.sourceImageDataUrl) && values.licenseConfirmed
      : values.mode === 'logo'
        ? true
        : values.mode === 'product'
          ? values.productName.trim().length > 0 || values.brandName.trim().length > 0
          : true);

  const previewPrompts =
    canSubmit ||
    values.brandName.trim() ||
    values.productName.trim() ||
    values.requirements.trim()
      ? buildPromptVariants(values, imageCount, promptVariation)
      : [];

  const generateLabel =
    values.mode === 'product'
      ? t(locale, 'form.generateProduct')
      : values.mode === 'home'
        ? t(locale, 'form.generateHome')
        : t(locale, 'form.generateLogo');

  return (
    <section className="space-y-4 border-b border-surface-border px-4 py-4">
      {!hasApiKey && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100">
          {t(locale, 'form.apiMissing')}{' '}
          <button
            type="button"
            onClick={onOpenSettings}
            className="font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200"
          >
            {t(locale, 'form.apiMissingLink')}
          </button>
          {t(locale, 'form.apiMissingSuffix')}
        </div>
      )}

      <div className="flex rounded-[10px] border border-accent-border bg-surface-banner p-0.5">
        {GENERATION_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
              values.mode === mode
                ? 'bg-accent-deep text-[#0c0a09]'
                : 'text-ink-muted hover:text-accent'
            }`}
          >
            {t(locale, `mode.${mode}`)}
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {t(locale, 'form.brand')}
        </span>
        <input
          type="text"
          value={values.brandName}
          onChange={(e) => onChange({ ...values, brandName: e.target.value })}
          placeholder={t(locale, 'form.brandPlaceholder')}
          className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-accent-border"
        />
      </label>

      <OptionGroup label={t(locale, 'form.imageSource')}>
        <OptionChip
          active={values.imageSource === 'generate'}
          label={t(locale, 'form.imageSourceGenerate')}
          hint=""
          onClick={() => onChange({ ...values, imageSource: 'generate' })}
        />
        <OptionChip
          active={values.imageSource === 'upload'}
          label={t(locale, 'form.imageSourceUpload')}
          hint=""
          onClick={() => onChange({ ...values, imageSource: 'upload' })}
        />
      </OptionGroup>

      {values.imageSource === 'upload' && (
        <div className="space-y-2 rounded-[10px] border border-accent-border bg-surface-banner p-3">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t(locale, 'form.uploadHint')}
          </p>
          {provider !== 'openai' && (
            <p className="text-[11px] text-amber-300">
              {t(locale, 'form.openaiOnlyUpload')}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {values.sourceImageDataUrl ? (
            <div className="flex items-center gap-2">
              <img
                src={values.sourceImageDataUrl}
                alt=""
                className="h-12 w-12 rounded object-cover ring-1 ring-surface-border"
              />
              <p className="min-w-0 flex-1 truncate text-[11px] text-zinc-300">
                {t(locale, 'form.uploadSelected', {
                  name: values.sourceImageName || 'image',
                })}
              </p>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...values,
                    sourceImageDataUrl: '',
                    sourceImageName: '',
                  })
                }
                className="rounded p-1 text-zinc-500 hover:text-zinc-200"
                aria-label={t(locale, 'form.uploadClear')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border px-3 py-3 text-xs text-zinc-400 hover:border-accent-border hover:text-accent"
            >
              <ImagePlus className="h-4 w-4" />
              {t(locale, 'form.upload')}
            </button>
          )}
          <label className="flex items-start gap-2 text-[11px] text-zinc-400">
            <input
              type="checkbox"
              checked={values.licenseConfirmed}
              onChange={(e) =>
                onChange({ ...values, licenseConfirmed: e.target.checked })
              }
              className="mt-0.5 accent-[#0ea5e9]"
            />
            <span>{t(locale, 'form.licenseConfirm')}</span>
          </label>
        </div>
      )}

      {values.mode === 'logo' && (
        <>
          <OptionGroup label={t(locale, 'form.layout')}>
            {LOGO_LAYOUTS.map((layout) => {
              const meta = layoutLabel(locale, layout);
              return (
                <OptionChip
                  key={layout}
                  active={values.layout === layout}
                  label={meta.label}
                  hint={meta.hint}
                  onClick={() =>
                    onChange({ ...values, layout: layout as LogoLayout })
                  }
                />
              );
            })}
          </OptionGroup>

          <OptionGroup label={t(locale, 'form.shape')}>
            {LOGO_SHAPES.map((shape) => {
              const meta = shapeLabel(locale, shape);
              return (
                <OptionChip
                  key={shape}
                  active={values.shape === shape}
                  label={meta.label}
                  hint={meta.hint}
                  onClick={() => handleShapeChange(shape)}
                />
              );
            })}
          </OptionGroup>
        </>
      )}

      {values.mode === 'product' && (
        <>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'form.productFormat')}
            </span>
            <div className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-4">
              {PRODUCT_FORMATS.map((format) => {
                const size = sizeForProductFormat(format);
                const meta = productFormatLabel(locale, format);
                return (
                  <FormatOption
                    key={format}
                    size={size}
                    active={values.productFormat === format}
                    label={meta.label}
                    hint={meta.hint}
                    onClick={() => handleProductFormatChange(format)}
                  />
                );
              })}
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              {t(locale, 'form.productFormatHint', {
                size: t(locale, `size.${imageSize}`),
              })}
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'form.productName')} <span className="text-rose-400">*</span>
            </span>
            <input
              type="text"
              value={values.productName}
              onChange={(e) =>
                onChange({ ...values, productName: e.target.value })
              }
              placeholder={t(locale, 'form.productNamePlaceholder')}
              className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-accent-border"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'form.productHeadline')}
            </span>
            <input
              type="text"
              value={values.productHeadline}
              onChange={(e) =>
                onChange({ ...values, productHeadline: e.target.value })
              }
              placeholder={t(locale, 'form.productHeadlinePlaceholder')}
              className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-accent-border"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'form.productPoints')}
            </span>
            <input
              type="text"
              value={values.productPoints}
              onChange={(e) =>
                onChange({ ...values, productPoints: e.target.value })
              }
              placeholder={t(locale, 'form.productPointsPlaceholder')}
              className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-accent-border"
            />
          </label>
        </>
      )}

      {values.mode === 'home' && (
        <>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'form.homeTitle')}
            </span>
            <input
              type="text"
              value={values.homeTitle}
              onChange={(e) => onChange({ ...values, homeTitle: e.target.value })}
              placeholder={t(locale, 'form.homeTitlePlaceholder')}
              className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-accent-border"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'form.homeSubtitle')}
            </span>
            <input
              type="text"
              value={values.homeSubtitle}
              onChange={(e) =>
                onChange({ ...values, homeSubtitle: e.target.value })
              }
              placeholder={t(locale, 'form.homeSubtitlePlaceholder')}
              className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-accent-border"
            />
          </label>

          <OptionGroup label={t(locale, 'form.textPlacement')}>
            {TEXT_PLACEMENTS.map((placement) => (
              <OptionChip
                key={placement}
                active={values.textPlacement === placement}
                label={t(locale, `placement.${placement}`)}
                hint=""
                onClick={() =>
                  onChange({
                    ...values,
                    textPlacement: placement as TextPlacement,
                  })
                }
              />
            ))}
          </OptionGroup>
        </>
      )}

      {values.imageSource === 'upload' && (
        <OptionGroup label={t(locale, 'form.reinterpret')}>
          {REINTERPRET_STRENGTHS.map((level) => (
            <OptionChip
              key={level}
              active={values.reinterpret === level}
              label={t(locale, `reinterpret.${level}`)}
              hint=""
              onClick={() =>
                onChange({
                  ...values,
                  reinterpret: level as ReinterpretStrength,
                })
              }
            />
          ))}
        </OptionGroup>
      )}

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {t(locale, 'form.keywords')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_TAGS.map((tag) => {
            const active = values.keywords.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? 'bg-surface-banner text-accent ring-1 ring-accent-border'
                    : 'bg-surface-raised text-zinc-400 ring-1 ring-surface-border hover:text-zinc-200'
                }`}
              >
                {styleTagLabel(locale, tag)}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-accent">
          {t(locale, 'form.requirements')}
        </span>
        <textarea
          value={values.requirements}
          onChange={(e) => onChange({ ...values, requirements: e.target.value })}
          placeholder={t(locale, 'form.requirementsPlaceholder')}
          rows={3}
          className="w-full resize-y rounded-lg border border-accent-border bg-surface-banner px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-accent-border focus:ring-1 focus:ring-accent-border"
        />
        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t(locale, 'form.requirementsHint')}
        </p>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {t(locale, 'form.colorTheme')}
        </span>
        <select
          value={values.colorTheme}
          onChange={(e) =>
            onChange({
              ...values,
              colorTheme: e.target.value as CreatorFormValues['colorTheme'],
            })
          }
          className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-accent-border"
        >
          {COLOR_THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {colorThemeLabel(locale, theme)}
            </option>
          ))}
        </select>
      </label>

      {values.colorTheme === 'Custom' && (
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">
            {t(locale, 'form.customColor')}
          </span>
          <input
            type="text"
            value={values.customColor}
            onChange={(e) => onChange({ ...values, customColor: e.target.value })}
            placeholder={t(locale, 'form.customColorPlaceholder')}
            className="w-full rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-accent-border"
          />
        </label>
      )}

      <button
        type="button"
        onClick={() => onPromptVariationChange(!promptVariation)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${
          promptVariation
            ? 'border-accent-border bg-surface-banner'
            : 'border-surface-border bg-surface-raised'
        }`}
      >
        <div className="flex items-center gap-2">
          <Shuffle
            className={`h-3.5 w-3.5 ${promptVariation ? 'text-accent' : 'text-zinc-500'}`}
          />
          <div>
            <p
              className={`text-xs font-medium ${
                promptVariation ? 'text-accent' : 'text-zinc-300'
              }`}
            >
              {t(locale, 'form.variation')}
            </p>
            <p className="text-[11px] text-zinc-500">
              {t(locale, 'form.variationHint')}
            </p>
          </div>
        </div>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            promptVariation
              ? 'bg-surface-banner text-accent'
              : 'bg-surface-overlay text-zinc-500'
          }`}
        >
          {promptVariation ? 'ON' : 'OFF'}
        </span>
      </button>

      {previewPrompts.length > 0 && (
        <details className="rounded-lg border border-accent-border bg-surface-banner">
          <summary className="cursor-pointer px-3 py-2 text-[11px] font-medium text-zinc-400 hover:text-zinc-300">
            {t(locale, 'form.promptPreview')}
            {promptVariation && imageCount > 1
              ? ` ${t(locale, 'form.promptVariants', { n: imageCount })}`
              : ''}
          </summary>
          <div className="space-y-2 border-t border-surface-border/60 px-3 py-2">
            {previewPrompts.map((prompt, index) => (
              <div key={index}>
                {promptVariation && imageCount > 1 && (
                  <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                    Variant {index + 1}
                  </p>
                )}
                <p className="text-[11px] leading-relaxed text-zinc-500">{prompt}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {t(locale, 'form.count')}
        </span>
        <div className="flex gap-1.5">
          {IMAGE_COUNTS.map((n) => {
            const active = imageCount === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onImageCountChange(n)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-surface-banner text-accent ring-1 ring-accent-border'
                    : 'bg-surface-raised text-zinc-400 ring-1 ring-surface-border hover:text-zinc-200'
                }`}
              >
                {t(locale, 'form.countUnit', { n })}
              </button>
            );
          })}
        </div>
      </div>

      {values.mode === 'home' && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">
            {t(locale, 'form.size')}
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {IMAGE_SIZES.map((size) => (
              <SizeOption
                key={size}
                size={size}
                active={imageSize === size}
                label={t(locale, `size.${size}`)}
                onClick={() => onImageSizeChange(size)}
              />
            ))}
          </div>
          {provider === 'google' && (
            <p className="text-[11px] text-zinc-500">
              {t(locale, 'form.googleSizeHint')}
            </p>
          )}
          {provider === 'openai' && imageSize === '2048x1152' && (
            <p className="text-[11px] text-zinc-500">
              {t(locale, 'form.wideHeroHint')}
            </p>
          )}
        </div>
      )}

      {values.mode === 'logo' && (
        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t(locale, 'form.logoSizeAutoHint', {
            size: t(locale, `size.${imageSize}`),
          })}
        </p>
      )}

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-deep px-4 py-2.5 text-sm font-semibold text-[#0c0a09] transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(locale, 'form.generating')}
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              {generateLabel}
            </>
          )}
        </button>
        {!loading && (
          <p className="text-center text-[11px] text-zinc-500">
            {t(locale, 'form.costHint', { cost: costLabel })}
            {promptVariation ? t(locale, 'form.variationOn') : ''}
          </p>
        )}
      </div>
    </section>
  );
}

const SIZE_FRAME: Record<
  ImageSize,
  { width: string; height: string; text: string }
> = {
  '1024x1024': { width: '2.1rem', height: '2.1rem', text: '1:1' },
  '1024x1536': { width: '1.55rem', height: '2.35rem', text: '2:3' },
  '1536x1024': { width: '2.35rem', height: '1.55rem', text: '3:2' },
  '2048x1152': { width: '2.55rem', height: '1.4rem', text: '16:9' },
};

function SizeOption({
  size,
  active,
  label,
  onClick,
}: {
  size: ImageSize;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const frame = SIZE_FRAME[size];
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition ${
        active
          ? 'bg-surface-banner ring-1 ring-accent-border'
          : 'bg-surface-raised ring-1 ring-surface-border hover:bg-surface-overlay'
      }`}
    >
      <div className="flex h-10 w-full items-center justify-center">
        <div
          className={`flex items-center justify-center rounded-[3px] border ${
            active
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-zinc-500 bg-zinc-800/80 text-zinc-400'
          }`}
          style={{ width: frame.width, height: frame.height }}
        >
          <span className="text-[8px] font-bold leading-none tracking-tight">
            {frame.text}
          </span>
        </div>
      </div>
      <span
        className={`text-center text-[9px] font-medium leading-tight ${
          active ? 'text-accent' : 'text-zinc-500'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function FormatOption({
  size,
  active,
  label,
  hint,
  onClick,
}: {
  size: ImageSize;
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  const frame = SIZE_FRAME[size];
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${label} · ${hint}`}
      className={`flex flex-col items-center gap-1 rounded-lg px-1.5 py-2 transition ${
        active
          ? 'bg-surface-banner ring-1 ring-accent-border'
          : 'bg-surface-raised ring-1 ring-surface-border hover:bg-surface-overlay'
      }`}
    >
      <div className="flex h-10 w-full items-center justify-center">
        <div
          className={`flex items-center justify-center rounded-[3px] border ${
            active
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-zinc-500 bg-zinc-800/80 text-zinc-400'
          }`}
          style={{ width: frame.width, height: frame.height }}
        >
          <span className="text-[8px] font-bold leading-none tracking-tight">
            {frame.text}
          </span>
        </div>
      </div>
      <span
        className={`text-center text-[10px] font-semibold leading-tight ${
          active ? 'text-accent' : 'text-zinc-300'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-center text-[9px] leading-tight ${
          active ? 'text-accent/80' : 'text-zinc-500'
        }`}
      >
        {hint}
      </span>
    </button>
  );
}

function OptionGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function OptionChip({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={hint || label}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 text-left transition ${
        active
          ? 'bg-surface-banner text-accent ring-1 ring-accent-border'
          : 'bg-surface-raised text-zinc-400 ring-1 ring-surface-border hover:text-zinc-200'
      }`}
    >
      <span className="block text-[11px] font-medium">{label}</span>
      {hint ? <span className="block text-[10px] opacity-70">{hint}</span> : null}
    </button>
  );
}
