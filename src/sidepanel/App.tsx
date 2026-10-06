import { useEffect, useMemo, useState } from 'react';
import { ConfirmGenerateModal } from '@/components/ConfirmGenerateModal';
import { Header } from '@/components/Header';
import { InputForm } from '@/components/InputForm';
import { GalleryTab, ResultGallery } from '@/components/ResultGallery';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { t } from '@/i18n';
import { estimateGenerationCost } from '@/lib/costEstimate';
import { ApiError, generateImages } from '@/lib/imageApi';
import { toPersistedDataUrl } from '@/lib/imageActions';
import {
  LicenseApiError,
  LicenseQuota,
  consumeLicenseQuota,
  fetchLicenseStatus,
  formatQuota,
} from '@/lib/licenseApi';
import { buildPromptVariants, titleForMode } from '@/lib/promptEngine';
import {
  clearHistory,
  loadHistory,
  loadSettings,
  prependHistory,
  removeHistoryItem,
  saveSettings,
} from '@/lib/storage';
import {
  AppSettings,
  CreatorFormValues,
  DEFAULT_SETTINGS,
  GeneratedLogo,
  ImageSize,
  INITIAL_FORM,
  Locale,
} from '@/types';

async function persistLogos(logos: GeneratedLogo[]): Promise<GeneratedLogo[]> {
  return Promise.all(
    logos.map(async (logo) => ({
      ...logo,
      url: await toPersistedDataUrl(logo.url),
    })),
  );
}

export type AppRuntime = 'extension' | 'web';

interface AppProps {
  runtime?: AppRuntime;
}

export default function App({ runtime = 'extension' }: AppProps) {
  const isWeb = runtime === 'web';
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<CreatorFormValues>(INITIAL_FORM);
  const [results, setResults] = useState<GeneratedLogo[]>([]);
  const [history, setHistory] = useState<GeneratedLogo[]>([]);
  const [galleryTab, setGalleryTab] = useState<GalleryTab>('results');
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [quota, setQuota] = useState<LicenseQuota | null>(null);
  const { toasts, push, dismiss } = useToast();
  const locale = settings.locale;

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'ko';
  }, [locale]);

  const isUploadEdit = form.imageSource === 'upload';

  const costEstimate = useMemo(
    () =>
      estimateGenerationCost(
        'openai',
        settings.imageCount,
        settings.imageSize,
        { mode: form.mode, isUploadEdit, managed: true },
      ),
    [settings.imageCount, settings.imageSize, form.mode, isUploadEdit],
  );

  const refreshQuota = async (next: AppSettings, announce = false) => {
    if (!next.licenseKey.trim()) {
      setQuota(null);
      return;
    }
    try {
      const status = await fetchLicenseStatus(next.apiBaseUrl, next.licenseKey);
      setQuota(status);
      if (announce) {
        push(
          t(next.locale, 'toast.licenseOk', {
            plan: status.plan_label || status.plan,
            quota: formatQuota(status),
          }),
          'success',
        );
      }
    } catch (error) {
      setQuota(null);
      if (announce) {
        const message =
          error instanceof LicenseApiError
            ? error.message
            : t(next.locale, 'toast.licenseFail');
        push(message, 'error');
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedSettings, storedHistory] = await Promise.all([
        loadSettings(),
        loadHistory(),
      ]);
      if (cancelled) return;
      setSettings(storedSettings);
      setHistory(storedHistory);
      setReady(true);
      if (!storedSettings.licenseKey.trim()) {
        setSettingsOpen(true);
        push(t(storedSettings.locale, 'toast.needLicenseKey'), 'info');
      } else {
        await refreshQuota(storedSettings, false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push]);

  const handleSaveSettings = async (next: AppSettings) => {
    await saveSettings(next);
    setSettings(next);
    push(t(next.locale, 'settings.savedToast'), 'success');
    await refreshQuota(next, Boolean(next.licenseKey.trim()));
  };

  const handleLocaleChange = async (nextLocale: Locale) => {
    const next = { ...settings, locale: nextLocale };
    setSettings(next);
    await saveSettings(next);
  };

  const handlePromptVariationChange = async (enabled: boolean) => {
    const next = { ...settings, promptVariation: enabled };
    setSettings(next);
    await saveSettings(next);
  };

  const handleImageCountChange = async (count: number) => {
    const next = { ...settings, imageCount: count };
    setSettings(next);
    await saveSettings(next);
  };

  const handleImageSizeChange = async (size: ImageSize) => {
    const next = { ...settings, imageSize: size };
    setSettings(next);
    await saveSettings(next);
  };

  const handleSuggestImageSize = async (size: ImageSize) => {
    const next = { ...settings, imageSize: size };
    setSettings(next);
    await saveSettings(next);
  };

  const handleRequestGenerate = () => {
    if (!settings.licenseKey.trim()) {
      push(t(locale, 'toast.needLicenseKey'), 'error');
      setSettingsOpen(true);
      return;
    }

    if (
      form.mode === 'product' &&
      form.imageSource === 'generate' &&
      !form.productName.trim() &&
      !form.brandName.trim()
    ) {
      push(t(locale, 'toast.needProduct'), 'error');
      return;
    }

    if (form.imageSource === 'upload') {
      if (!form.sourceImageDataUrl) {
        push(t(locale, 'toast.needUpload'), 'error');
        return;
      }
      if (!form.licenseConfirmed) {
        push(t(locale, 'toast.needLicense'), 'error');
        return;
      }
    }

    setConfirmOpen(true);
  };

  const handleConfirmGenerate = async () => {
    setConfirmOpen(false);
    const prompts = buildPromptVariants(
      form,
      settings.imageCount,
      settings.promptVariation,
    );
    setLoading(true);
    setGalleryTab('results');

    const fidelity =
      form.reinterpret === 'light'
        ? 'high'
        : ('low' as const);

    try {
      const result = await generateImages({
        provider: 'openai',
        apiKey: '',
        prompts,
        brandName: titleForMode(form),
        size: settings.imageSize,
        mode: form.mode,
        sourceImageDataUrl: isUploadEdit
          ? form.sourceImageDataUrl
          : undefined,
        inputFidelity: isUploadEdit ? fidelity : undefined,
        licenseKey: settings.licenseKey,
        apiBaseUrl: settings.apiBaseUrl,
        useServerProxy: true,
      });

      setResults(result.logos);

      if (result.quotaConsumedOnServer && result.quota) {
        setQuota(result.quota as LicenseQuota);
      } else if (result.succeeded > 0) {
        try {
          const after = await consumeLicenseQuota(
            settings.apiBaseUrl,
            settings.licenseKey,
            result.succeeded,
          );
          setQuota(after);
        } catch {
          push(t(locale, 'toast.quotaConsumeFail'), 'info');
        }
      }

      try {
        const persisted = await persistLogos(result.logos);
        const nextHistory = await prependHistory(persisted);
        setHistory(nextHistory);
      } catch {
        push(t(locale, 'toast.historyFail'), 'info');
      }

      if (result.failed > 0) {
        push(
          t(locale, 'toast.partial', {
            succeeded: result.succeeded,
            requested: result.requested,
            failed: result.failed,
          }),
          'info',
        );
        if (result.errors[0]) {
          push(result.errors[0], 'error');
        }
      } else {
        push(t(locale, 'toast.success', { n: result.succeeded }), 'success');
      }
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof LicenseApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : t(locale, 'toast.unknown');
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    const next = await removeHistoryItem(id);
    setHistory(next);
    push(t(locale, 'toast.historyDeleted'), 'success');
  };

  const handleClearHistory = async () => {
    const next = await clearHistory();
    setHistory(next);
    push(t(locale, 'toast.historyCleared'), 'success');
  };

  if (!ready) {
    return (
      <div className="flex h-full min-w-panel items-center justify-center bg-surface">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />
      </div>
    );
  }

  const shellClass = isWeb
    ? 'mx-auto flex h-full w-full max-w-3xl flex-col bg-surface shadow-2xl shadow-black/40 ring-1 ring-surface-border/60 md:my-4 md:h-[calc(100%-2rem)] md:rounded-2xl'
    : 'flex h-full min-w-panel flex-col bg-surface';

  return (
    <div className={isWeb ? 'h-full bg-gradient-to-b from-zinc-950 via-surface to-zinc-950' : 'h-full'}>
      <div className={shellClass}>
        <Header
          locale={locale}
          hasApiKey={Boolean(settings.licenseKey.trim())}
          onOpenSettings={() => setSettingsOpen(true)}
          onLocaleChange={handleLocaleChange}
          planLabel={quota?.plan_label || undefined}
          quotaLabel={formatQuota(quota)}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <InputForm
            locale={locale}
            provider="openai"
            values={form}
            loading={loading}
            hasApiKey={Boolean(settings.licenseKey.trim())}
            costLabel={costEstimate.label}
            imageCount={settings.imageCount}
            imageSize={settings.imageSize}
            promptVariation={settings.promptVariation}
            onPromptVariationChange={handlePromptVariationChange}
            onImageCountChange={handleImageCountChange}
            onImageSizeChange={handleImageSizeChange}
            onSuggestImageSize={handleSuggestImageSize}
            onChange={setForm}
            onSubmit={handleRequestGenerate}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          <ResultGallery
            locale={locale}
            tab={galleryTab}
            onTabChange={setGalleryTab}
            results={results}
            history={history}
            loading={loading}
            skeletonCount={settings.imageCount}
            onToast={push}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
          />
        </main>

        <ConfirmGenerateModal
          open={confirmOpen}
          locale={locale}
          title={titleForMode(form)}
          estimate={costEstimate}
          promptVariation={settings.promptVariation}
          confirming={loading}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmGenerate}
        />

        <SettingsPanel
          open={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveSettings}
          hideApiBaseUrl={isWeb}
        />

        <Toast toasts={toasts} onDismiss={dismiss} />
      </div>
    </div>
  );
}
