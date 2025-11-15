/**
 * Compute the how much we need to scale up or down the stage(canvas)
 * to make it fit inside the container
 * @param containerW the width of the container wrapper for the convas
 * @param containerH the height of the container wrapper for the convas
 * @param canvasW canvas width
 * @param canvasH canvas height
 */
export function computeStageScale(
  containerW: number,
  containerH: number,
  canvasW: number,
  canvasH: number
): number {
  if (!containerW || !containerH || !canvasW || !canvasH) {
    return 1;
  }

  // Calculate the scale to fit the container while maintaining aspect ratio
  return Math.min(containerW / canvasW, containerH / canvasH);
}

export function computeRootDimensions(
  imgW: number,
  imgH: number,
  stageScale: number,
  cropPadX: number,
  cropPadY: number
): { stageW: number; stageH: number; drawW: number; drawH: number } {
  const stageW = imgW * stageScale - cropPadY;
  const stageH = imgH * stageScale - cropPadX;
  const drawW = stageW;
  const drawH = stageH;
  return { stageW, stageH, drawW, drawH };
}

export function computeOverlayDimensions(
  imgW: number,
  imgH: number,
  stageScale: number
): { drawW: number; drawH: number } {
  const drawW = imgW * (stageScale / 2);
  const drawH = imgH * (stageScale / 2);
  return { drawW, drawH };
}
