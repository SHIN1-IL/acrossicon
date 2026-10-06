import { AiProvider, GeneratedLogo, GenerationMode, ImageSize } from '@/types';
import { isWebRuntime, normalizeApiBase } from '@/lib/config';
import { LicenseApiError } from '@/lib/licenseApi';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface GenerateOptions {
  provider: AiProvider;
  apiKey: string;
  prompts: string[];
  brandName: string;
  size: ImageSize;
  mode?: GenerationMode;
  sourceImageDataUrl?: string;
  inputFidelity?: 'high' | 'low';
  /** Required for web proxy + optional for extension quota path. */
  licenseKey?: string;
  apiBaseUrl?: string;
  /** When true, use server /api/generate (CORS-safe). Default: web runtime. */
  useServerProxy?: boolean;
}

export interface GenerateResult {
  logos: GeneratedLogo[];
  requested: number;
  succeeded: number;
  failed: number;
  errors: string[];
  /** Present when generated via server proxy (quota already consumed). */
  quotaConsumedOnServer?: boolean;
  quota?: unknown;
}

interface OpenAiImageResponse {
  data?: Array<{ url?: string; b64_json?: string; revised_prompt?: string }>;
  error?: { message?: string };
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof LicenseApiError) return new ApiError(error.message, error.status);
  if (error instanceof TypeError) {
    return new ApiError('네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.');
  }
  return new ApiError(error instanceof Error ? error.message : 'Unknown API error');
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new ApiError('업로드 이미지를 읽지 못했습니다.');
  return response.blob();
}

/** Wide hero sizes need gpt-image-2 flexible resolution. */
function openAiModelForSize(size: ImageSize): string {
  return size === '2048x1152' ? 'gpt-image-2' : 'gpt-image-1';
}

async function generateOpenAiImage(
  apiKey: string,
  prompt: string,
  size: ImageSize,
): Promise<{ url: string; revisedPrompt?: string }> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: openAiModelForSize(size),
      prompt,
      n: 1,
      size,
      quality: 'medium',
      output_format: 'png',
      background: 'opaque',
    }),
  });

  const payload = (await response.json()) as OpenAiImageResponse;
  if (!response.ok) {
    throw new ApiError(
      payload.error?.message || `OpenAI API error (${response.status})`,
      response.status,
    );
  }

  const image = payload.data?.[0];
  if (!image?.b64_json && !image?.url) {
    throw new ApiError('No image returned from OpenAI.');
  }

  const url = image.b64_json
    ? `data:image/png;base64,${image.b64_json}`
    : (image.url as string);
  return { url, revisedPrompt: image.revised_prompt };
}

async function editOpenAiImage(
  apiKey: string,
  prompt: string,
  size: ImageSize,
  sourceImageDataUrl: string,
  inputFidelity: 'high' | 'low' = 'low',
): Promise<{ url: string; revisedPrompt?: string }> {
  const blob = await dataUrlToBlob(sourceImageDataUrl);
  const model = openAiModelForSize(size);
  const form = new FormData();
  form.append('model', model);
  form.append('prompt', prompt);
  form.append('n', '1');
  form.append('size', size);
  form.append('quality', 'medium');
  form.append('output_format', 'png');
  if (model !== 'gpt-image-2') {
    form.append('input_fidelity', inputFidelity);
  }
  form.append('image', blob, 'source.png');

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const payload = (await response.json()) as OpenAiImageResponse;
  if (!response.ok) {
    throw new ApiError(
      payload.error?.message || `OpenAI Edit API error (${response.status})`,
      response.status,
    );
  }

  const image = payload.data?.[0];
  if (!image?.b64_json && !image?.url) {
    throw new ApiError('No edited image returned from OpenAI.');
  }

  const url = image.b64_json
    ? `data:image/png;base64,${image.b64_json}`
    : (image.url as string);
  return { url, revisedPrompt: image.revised_prompt };
}

function googleAspectRatio(size: ImageSize): string {
  switch (size) {
    case '1024x1536':
      return '3:4';
    case '1536x1024':
      return '4:3';
    case '2048x1152':
      return '16:9';
    default:
      return '1:1';
  }
}

async function generateGoogleImage(
  apiKey: string,
  prompt: string,
  size: ImageSize = '1024x1024',
): Promise<{ url: string }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: googleAspectRatio(size) },
    }),
  });

  const payload = (await response.json()) as {
    predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new ApiError(
      payload.error?.message || `Google Imagen API error (${response.status})`,
      response.status,
    );
  }

  const prediction = payload.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    throw new ApiError(
      'No image returned from Google Imagen. Check that Imagen is enabled for your API key.',
    );
  }

  const mime = prediction.mimeType || 'image/png';
  return { url: `data:${mime};base64,${prediction.bytesBase64Encoded}` };
}

async function generateOne(
  options: GenerateOptions,
  index: number,
  prompt: string,
): Promise<GeneratedLogo> {
  const {
    provider,
    apiKey,
    brandName,
    size,
    mode,
    sourceImageDataUrl,
    inputFidelity = 'low',
  } = options;

  if (sourceImageDataUrl) {
    if (provider !== 'openai') {
      throw new ApiError('이미지 업로드 변환은 OpenAI Provider에서만 지원됩니다.');
    }
    const result = await editOpenAiImage(
      apiKey,
      prompt,
      size,
      sourceImageDataUrl,
      inputFidelity,
    );
    return {
      id: `${Date.now()}-${index}-${crypto.randomUUID()}`,
      url: result.url,
      prompt: result.revisedPrompt || prompt,
      brandName,
      createdAt: Date.now(),
      mode,
    };
  }

  if (provider === 'openai') {
    const result = await generateOpenAiImage(apiKey, prompt, size);
    return {
      id: `${Date.now()}-${index}-${crypto.randomUUID()}`,
      url: result.url,
      prompt: result.revisedPrompt || prompt,
      brandName,
      createdAt: Date.now(),
      mode,
    };
  }

  const result = await generateGoogleImage(apiKey, prompt, size);
  return {
    id: `${Date.now()}-${index}-${crypto.randomUUID()}`,
    url: result.url,
    prompt,
    brandName,
    createdAt: Date.now(),
    mode,
  };
}

async function generateViaServer(options: GenerateOptions): Promise<GenerateResult> {
  const prompts = options.prompts.filter((p) => p.trim().length > 0);
  const safeCount = Math.min(Math.max(prompts.length, 0), 4);
  const licenseKey = (options.licenseKey || '').trim();
  if (!licenseKey) {
    throw new ApiError('라이선스 키를 설정에서 등록해 주세요.');
  }
  if (!options.apiKey.trim()) {
    throw new ApiError('API Key가 등록되지 않았습니다. 설정에서 Key를 입력해 주세요.');
  }
  if (safeCount === 0) {
    throw new ApiError('생성할 프롬프트가 없습니다.');
  }

  const base = normalizeApiBase(options.apiBaseUrl);
  let res: Response;
  try {
    res = await fetch(`${base}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        provider: options.provider,
        api_key: options.apiKey,
        prompts: prompts.slice(0, safeCount),
        brand_name: options.brandName,
        size: options.size,
        mode: options.mode,
        source_image_data_url: options.sourceImageDataUrl,
        input_fidelity: options.inputFidelity || 'low',
      }),
    });
  } catch {
    throw new ApiError('라이선스 서버에 연결할 수 없습니다. 서버 주소·네트워크를 확인해 주세요.');
  }

  const data = (await res.json().catch(() => ({}))) as {
    detail?: string | { msg?: string }[];
    logos?: GeneratedLogo[];
    requested?: number;
    succeeded?: number;
    failed?: number;
    errors?: string[];
    quota?: unknown;
  };

  if (!res.ok) {
    const detail = data.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail
              .map((d) =>
                typeof d === 'object' && d && 'msg' in d ? String(d.msg) : String(d),
              )
              .join(', ')
          : `생성 오류 (${res.status})`;
    throw new ApiError(message, res.status);
  }

  const logos = (data.logos || []).map((logo, index) => ({
    ...logo,
    id: logo.id || `${Date.now()}-${index}`,
    createdAt: logo.createdAt || Date.now(),
  }));

  if (logos.length === 0) {
    throw new ApiError(data.errors?.[0] || '이미지 생성에 실패했습니다.');
  }

  return {
    logos,
    requested: data.requested ?? safeCount,
    succeeded: data.succeeded ?? logos.length,
    failed: data.failed ?? 0,
    errors: data.errors || [],
    quotaConsumedOnServer: true,
    quota: data.quota,
  };
}

export async function generateImages(options: GenerateOptions): Promise<GenerateResult> {
  const useProxy = options.useServerProxy ?? isWebRuntime();
  if (useProxy) {
    return generateViaServer(options);
  }

  const prompts = options.prompts.filter((p) => p.trim().length > 0);
  const safeCount = Math.min(Math.max(prompts.length, 0), 4);

  if (!options.apiKey.trim()) {
    throw new ApiError('API Key가 등록되지 않았습니다. 설정에서 Key를 입력해 주세요.');
  }
  if (safeCount === 0) {
    throw new ApiError('생성할 프롬프트가 없습니다.');
  }

  const settled = await Promise.allSettled(
    prompts.slice(0, safeCount).map((prompt, index) =>
      generateOne(options, index, prompt),
    ),
  );

  const logos: GeneratedLogo[] = [];
  const errors: string[] = [];

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      logos.push(result.value);
      continue;
    }
    errors.push(toApiError(result.reason).message);
  }

  if (logos.length === 0) {
    throw new ApiError(errors[0] || '이미지 생성에 실패했습니다.');
  }

  return {
    logos,
    requested: safeCount,
    succeeded: logos.length,
    failed: errors.length,
    errors,
  };
}

export const generateLogos = generateImages;
