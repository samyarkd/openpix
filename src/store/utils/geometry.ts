import { CROP_SIZE } from '../editor.types';

export type StageScale = {
  stageScaleX: number;
  stageScaleY: number;
  stageScale: number;
};

export function computeStageScale(
  containerW: number,
  containerH: number,
  imgW: number,
  imgH: number
): StageScale {
  const stageScaleX = containerW / (imgW || 1);
  const stageScaleY = containerH / (imgH || 1);
  const valid = imgW > 0 && imgH > 0 && containerW > 0 && containerH > 0;
  const stageScale = valid ? Math.min(stageScaleX, stageScaleY) : 1;
  return { stageScaleX, stageScaleY, stageScale };
}

export function computeCropPads(
  activeTab: 'enhance' | 'crop' | 'type' | 'brush' | 'sticker',
  scaleX: number,
  scaleY: number
): { cropPadX: number; cropPadY: number } {
  const isCrop = activeTab === 'crop';
  const cropPadX = isCrop ? CROP_SIZE * scaleX : 0;
  const cropPadY = isCrop ? CROP_SIZE * scaleY : 0;
  return { cropPadX, cropPadY };
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
  stageScale: number,
  cropPadX: number,
  cropPadY: number
): { drawW: number; drawH: number } {
  // overlays are scaled down by half compared to root
  const drawW = imgW * (stageScale / 2) - cropPadY;
  const drawH = imgH * (stageScale / 2) - cropPadX;
  return { drawW, drawH };
}
