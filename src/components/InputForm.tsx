import { type ReactNode, useRef } from 'react';
import { ImagePlus, Loader2, Shuffle, Wand2, X } from 'lucide-react';
import {
  AiProvider,
  COLOR_THEMES,
  CreatorFormValues,
  GENERATION_MODES,
  GenerationMode,
  ImageSize,
  LOGO_LAYOUTS,
  LOGO_SHAPES,
  Locale,
  LogoLayout,
  LogoShape,
  REINTERPRET_STRENGTHS,
  STYLE_TAGS,
  TEXT_PLACEMENTS,
  TextPlacement,
  ReinterpretStrength,
} from '@/types';
import {
  colorThemeLabel,
  layoutLabel,
  shapeLabel,
  styleTagLabel,
  t,
} from '@/i18n';
import {
  buildPromptVariants,
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
  promptVariation: boolean;
  onPromptVariationChange: (enabled: boolean) => void;
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
  promptVariation,
  onPromptVariationChange,
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
    onSuggestImageSize(suggestedImageSizeForMode(mode));
  };

  const handleShapeChange = (shape: LogoShape) => {
    onChange({ ...values, shape });
    onSuggestImageSize(suggestedImageSizeForShape(shape));
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
    (values.mode === 'logo'
      ? values.brandName.trim().length > 0
      : values.mode === 'product'
        ? values.productName.trim().length > 0 || values.brandName.trim().length > 0
        : values.homeSource === 'upload'
          ? Boolean(values.sourceImageDataUrl) && values.licenseConfirmed
          : true);

  const previewPrompts =
    canSubmit || values.brandName.trim() || values.productName.trim()
      ? buildPromptVariants(values, imageCount, promptVariation)
      : [];

  const generateLabel =
    values.mode === 'product'
      ? t(locale, 'form.generateProduct')
      : values.mode === 'home'
        ? t(locale, 'form.generateHome')
        : t(locale, 'form.generateLogo');

  return (
    <section className="space-y-4 border-b border-surface-border/60 px-4 py-4">
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

      <div className="flex rounded-lg bg-surface-raised p-0.5 ring-1 ring-surface-border">
        {GENERATION_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
              values.mode === mode
                ? 'bg-surface-overlay text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t(locale, `mode.${mode}`)}
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {t(locale, 'form.brand')}
          {values.mode === 'logo' && <span className="text-rose-400"> *</span>}
        </span>
        <input
          type="text"
          value={values.brandName}
          onChange={(e) => onChange({ ...values, brandName: e.target.value })}
          placeholder={t(locale, 'form.brandPlaceholder')}
          className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
        />
      </label>

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
              className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
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
              className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
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
              className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
            />
          </label>
        </>
      )}

      {values.mode === 'home' && (
        <>
          <OptionGroup label={t(locale, 'form.homeSource')}>
            <OptionChip
              active={values.homeSource === 'generate'}
              label={t(locale, 'form.homeSourceGenerate')}
              hint=""
              onClick={() => onChange({ ...values, homeSource: 'generate' })}
            />
            <OptionChip
              active={values.homeSource === 'upload'}
              label={t(locale, 'form.homeSourceUpload')}
              hint=""
              onClick={() => onChange({ ...values, homeSource: 'upload' })}
            />
          </OptionGroup>

          {values.homeSource === 'upload' && (
            <div className="space-y-2 rounded-lg border border-surface-border bg-surface-raised/60 p-3">
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
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border px-3 py-3 text-xs text-zinc-400 hover:border-sky-500/40 hover:text-sky-300"
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
                  className="mt-0.5 accent-sky-500"
                />
                <span>{t(locale, 'form.licenseConfirm')}</span>
              </label>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              {t(locale, 'form.homeTitle')}
            </span>
            <input
              type="text"
              value={values.homeTitle}
              onChange={(e) => onChange({ ...values, homeTitle: e.target.value })}
              placeholder={t(locale, 'form.homeTitlePlaceholder')}
              className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
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
              className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
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

          {values.homeSource === 'upload' && (
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
        </>
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
                    ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
                    : 'bg-surface-raised text-zinc-400 ring-1 ring-surface-border hover:text-zinc-200'
                }`}
              >
                {styleTagLabel(locale, tag)}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={values.customKeyword}
          onChange={(e) => onChange({ ...values, customKeyword: e.target.value })}
          placeholder={t(locale, 'form.keywordsPlaceholder')}
          className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
        />
      </div>

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
          className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-sky-500/60"
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
            className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/60"
          />
        </label>
      )}

      <button
        type="button"
        onClick={() => onPromptVariationChange(!promptVariation)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${
          promptVariation
            ? 'border-sky-500/40 bg-sky-500/10'
            : 'border-surface-border bg-surface-raised'
        }`}
      >
        <div className="flex items-center gap-2">
          <Shuffle
            className={`h-3.5 w-3.5 ${promptVariation ? 'text-sky-300' : 'text-zinc-500'}`}
          />
          <div>
            <p
              className={`text-xs font-medium ${
                promptVariation ? 'text-sky-200' : 'text-zinc-300'
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
              ? 'bg-sky-500/20 text-sky-300'
              : 'bg-surface-overlay text-zinc-500'
          }`}
        >
          {promptVariation ? 'ON' : 'OFF'}
        </span>
      </button>

      {previewPrompts.length > 0 && (
        <details className="rounded-lg border border-surface-border/80 bg-surface-raised/60">
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
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
          ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/40'
          : 'bg-surface-raised text-zinc-400 ring-1 ring-surface-border hover:text-zinc-200'
      }`}
    >
      <span className="block text-[11px] font-medium">{label}</span>
      {hint ? <span className="block text-[10px] opacity-70">{hint}</span> : null}
    </button>
  );
}
