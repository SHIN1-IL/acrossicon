import { fetchImageBlob } from '@/lib/imageActions';

export interface RemoveBgOptions {
  /** Distance from pure white (0–441) below which pixels become transparent. */
  tolerance?: number;
  /** Soft edge width beyond tolerance. */
  feather?: number;
}

/**
 * Removes near-white backgrounds via Canvas pixel processing.
 * Returns a PNG data URL with alpha channel.
 */
export async function removeWhiteBackground(
  url: string,
  options: RemoveBgOptions = {},
): Promise<string> {
  const tolerance = options.tolerance ?? 36;
  const feather = options.feather ?? 28;

  const blob = await fetchImageBlob(url);
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas를 초기화할 수 없습니다.');

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);

    if (dist <= tolerance) {
      data[i + 3] = 0;
    } else if (dist < tolerance + feather) {
      const t = (dist - tolerance) / feather;
      data[i + 3] = Math.round(data[i + 3] * t);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export async function removeWhiteBackgroundBlob(
  url: string,
  options?: RemoveBgOptions,
): Promise<Blob> {
  const dataUrl = await removeWhiteBackground(url, options);
  const res = await fetch(dataUrl);
  return res.blob();
}
