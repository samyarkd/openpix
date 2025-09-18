import { castDraft } from 'immer';
import type { SliceCreator } from '../editor.types';
import { defaultFilters, type ImageItem } from '../editor.types';
import { computeCropPads, computeOverlayDimensions, computeRootDimensions, computeStageScale } from '../utils/geometry';
import { loadImage } from '~/lib/load-image';

export const createImagesSlice: SliceCreator<{
  images: ImageItem[];
  rootImage: ImageItem | null;
  activeImageId: string | null;
  addImage: (imgUrl: string) => void;
  setImageFilters: (id: string, filters: Partial<ImageItem['filters']>) => void;
  setActiveImage: (id: string | null) => void;
}> = (set, get) => ({
  images: [],
  rootImage: null,
  activeImageId: null,

  addImage: async (imgUrl) => {
    try {
      const loadedImg = await loadImage(imgUrl, { crossOrigin: 'anonymous' });

      const imgW = loadedImg?.width || 0;
      const imgH = loadedImg?.height || 0;

      const imgObj: ImageItem = {
        id: crypto.randomUUID(),
        img: loadedImg,
        filters: defaultFilters,
        drawW: 0,
        drawH: 0,
      };

      set((state) => {
        const imgCount = state.images.length;

        if (imgCount === 0) {
          const containerH = state.container.height;
          const containerW = state.container.width;

          const { stageScaleX, stageScaleY, stageScale } = computeStageScale(containerW, containerH, imgW, imgH);
          const { cropPadX, cropPadY } = computeCropPads(state.activeTab, stageScaleX, stageScaleY);
          const { stageW, stageH, drawW, drawH } = computeRootDimensions(imgW, imgH, stageScale, cropPadX, cropPadY);

          imgObj.drawW = drawW;
          imgObj.drawH = drawH;

          // set root data
          state.stageScale = stageScale;
          state.stageScaleX = stageScaleX;
          state.stageScaleY = stageScaleY;
          state.stageW = stageW;
          state.stageH = stageH;

          state.rootImage = castDraft(imgObj);
        } else {
          const { cropPadX, cropPadY } = computeCropPads(state.activeTab, state.stageScaleX, state.stageScaleY);
          // other new images will be scaled down
          const { drawW, drawH } = computeOverlayDimensions(imgW, imgH, state.stageScale, cropPadX, cropPadY);
          imgObj.drawW = drawW;
          imgObj.drawH = drawH;
        }

        state.images = [...state.images, castDraft(imgObj)];
      });

      if (imgUrl.startsWith('blob:')) URL.revokeObjectURL(imgUrl);
    } catch (error) {
      console.error('Failed to load the image', error);
    }
  },

  setImageFilters: (id, filters) => {
    set((state) => {
      const image = state.images[state.images.findIndex((f) => f.id === id)];
      if (!image) return;
      for (const key of Object.keys(filters) as (keyof ImageItem['filters'])[]) {
        image.filters[key] = filters[key] ?? image.filters[key];
      }
    });
  },

  setActiveImage: (id) => {
    set((state) => {
      state.activeImageId = id ?? null;
    });
  },
});
