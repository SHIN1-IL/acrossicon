/** Fetch image as Blob (supports http(s) and data URLs). */
export async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('이미지를 불러오지 못했습니다.');
  }
  return response.blob();
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, '_').slice(0, 48) || 'logo';
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('이미지를 인코딩하지 못했습니다.'));
    reader.readAsDataURL(blob);
  });
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), type, quality);
  });
}

/**
 * Shrink images before history persistence to reduce storage pressure.
 * Prefers WebP (keeps transparency) then PNG; falls back to original bytes.
 */
async function compressForHistory(blob: Blob): Promise<string> {
  try {
    const bitmap = await createImageBitmap(blob);
    const maxEdge = 1024;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return blobToDataUrl(blob);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const webp = await canvasToBlob(canvas, 'image/webp', 0.82);
    if (webp && webp.size > 0 && webp.size < blob.size * 0.95) {
      return blobToDataUrl(webp);
    }
    const png = await canvasToBlob(canvas, 'image/png');
    if (png && png.size > 0 && png.size < blob.size) {
      return blobToDataUrl(png);
    }
  } catch {
    // fall through
  }
  return blobToDataUrl(blob);
}

/** Persist remote/local images as compact data URLs so history survives URL expiry. */
export async function toPersistedDataUrl(url: string): Promise<string> {
  const blob = await fetchImageBlob(url);
  return compressForHistory(blob);
}

export async function downloadPng(
  url: string,
  brandName: string,
  suffix = '',
): Promise<void> {
  const tag = suffix ? `-${suffix}` : '';
  const filename = `acrossicon-${sanitizeFilename(brandName)}${tag}-${Date.now()}.png`;

  if (typeof chrome !== 'undefined' && chrome.downloads?.download) {
    await chrome.downloads.download({
      url,
      filename,
      saveAs: true,
    });
    return;
  }

  const blob = await fetchImageBlob(url);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export async function copyImageToClipboard(url: string): Promise<void> {
  const blob = await fetchImageBlob(url);
  const pngBlob = blob.type === 'image/png' ? blob : await convertToPngBlob(blob);

  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': pngBlob }),
  ]);
}

async function convertToPngBlob(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas를 초기화할 수 없습니다.');
  ctx.drawImage(bitmap, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('PNG 변환에 실패했습니다.'));
        return;
      }
      resolve(result);
    }, 'image/png');
  });
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
