import Konva from 'konva';

export type ExportOptions = {
  mimeType?: string; // 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number; // 0..1 for jpeg/webp
  pixelRatio?: number; // scale multiplier
  x?: number; // crop x in stage coords
  y?: number; // crop y in stage coords
  width?: number; // crop width in stage coords
  height?: number; // crop height in stage coords
};

export function exportStageDataURL(
  stage: Konva.Stage,
  options: ExportOptions = {}
): string {
  const {
    mimeType = 'image/png',
    quality = 1,
    pixelRatio = typeof window !== 'undefined'
      ? window.devicePixelRatio || 1
      : 1,
  } = options;

  return stage.toDataURL({
    mimeType,
    quality,
    pixelRatio,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  });
}

export async function exportStageBlob(
  stage: Konva.Stage,
  options?: ExportOptions
): Promise<Blob> {
  const dataURL = exportStageDataURL(stage, options);
  const res = await fetch(dataURL);
  return await res.blob();
}

export async function downloadStage(
  stage: Konva.Stage,
  filename = 'export.png',
  options?: ExportOptions
): Promise<void> {
  const dataURL = exportStageDataURL(stage, options);
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
