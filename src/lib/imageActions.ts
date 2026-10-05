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

/** Persist remote image URLs as data URLs so history survives URL expiry. */
export async function toPersistedDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const blob = await fetchImageBlob(url);
  return blobToDataUrl(blob);
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
