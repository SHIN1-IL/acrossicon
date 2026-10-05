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

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<CreatorFormValues>(INITIAL_FORM);
  const [results, setResults] = useState<GeneratedLogo[]>([]);
  const [history, setHistory] = useState<GeneratedLogo[]>([]);
  const [galleryTab, setGalleryTab] = useState<GalleryTab>('results');
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const { toasts, push, dismiss } = useToast();
  const locale = settings.locale;

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'ko';
  }, [locale]);

  const isUploadEdit = form.imageSource === 'upload';

  const costEstimate = useMemo(
    () =>
      estimateGenerationCost(
        settings.provider,
        settings.imageCount,
        settings.imageSize,
        { mode: form.mode, isUploadEdit },
      ),
    [
      settings.provider,
      settings.imageCount,
      settings.imageSize,
      form.mode,
      isUploadEdit,
    ],
  );

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
      if (!storedSettings.apiKey) {
        push(t(storedSettings.locale, 'toast.apiKeyHint'), 'info');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [push]);

  const handleSaveSettings = async (next: AppSettings) => {
    await saveSettings(next);
    setSettings(next);
    push(t(next.locale, 'settings.savedToast'), 'success');
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
    if (!settings.apiKey) {
      push(t(locale, 'toast.needKey'), 'error');
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
      if (settings.provider !== 'openai') {
        push(t(locale, 'toast.needOpenAI'), 'error');
        setSettingsOpen(true);
        return;
      }
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
        provider: settings.provider,
        apiKey: settings.apiKey,
        prompts,
        brandName: titleForMode(form),
        size: settings.imageSize,
        mode: form.mode,
        sourceImageDataUrl: isUploadEdit
          ? form.sourceImageDataUrl
          : undefined,
        inputFidelity: isUploadEdit ? fidelity : undefined,
      });

      setResults(result.logos);

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
        error instanceof ApiError
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

  return (
    <div className="flex h-full min-w-panel flex-col bg-surface">
      <Header
        locale={locale}
        hasApiKey={Boolean(settings.apiKey)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLocaleChange={handleLocaleChange}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <InputForm
          locale={locale}
          provider={settings.provider}
          values={form}
          loading={loading}
          hasApiKey={Boolean(settings.apiKey)}
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
      />

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
