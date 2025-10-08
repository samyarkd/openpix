import type { SliceCreator } from '../editor.types';
import { type CanvasSlice } from '../editor.types';
import {
  computeCropPads,
  computeRootDimensions,
  computeStageScale,
} from '../utils/geometry';

export const createCanvasSlice: SliceCreator<CanvasSlice> = (set, get) => ({
  // CanvasData
  stageW: 0,
  stageH: 0,
  stageScale: 0,
  stageScaleX: 0,
  stageScaleY: 0,

  container: { height: 0, width: 0 },

  /**
   * Runs every time stage or container size changes
   */
  handleResize: () => {
    set((state) => {
      for (let idx = 0; idx < state.images.length; idx++) {
        const image = state.images[idx];
        const imgW = image.img?.width || 0;
        const imgH = image.img?.height || 0;

        // Root image should fit the stage
        if (idx === 0) {
          const containerH = state.container.height;
          const containerW = state.container.width;

          const { stageScaleX, stageScaleY, stageScale } = computeStageScale(
            containerW,
            containerH,
            imgW,
            imgH
          );
          const { cropPadX, cropPadY } = computeCropPads(
            state.activeTab,
            stageScaleX,
            stageScaleY
          );
          const { stageW, stageH, drawW, drawH } = computeRootDimensions(
            imgW,
            imgH,
            stageScale,
            cropPadX,
            cropPadY
          );

          // set root data
          state.stageScale = stageScale;
          state.stageScaleX = stageScaleX;
          state.stageScaleY = stageScaleY;
          state.stageW = stageW;
          state.stageH = stageH;

          if (state.rootImage) {
            state.rootImage.drawH = drawH;
            state.rootImage.drawW = drawW;
          }

          if (image.drawW && image.drawH) {
            image.drawW = drawW;
            image.drawH = drawH;
          }
        } else {
          const { cropPadX, cropPadY } = computeCropPads(
            state.activeTab,
            state.stageScaleX,
            state.stageScaleY
          );
          // other new images will be scaled down
          if (image.drawW && image.drawH) {
            image.drawW = imgW * (state.stageScale / 2) - cropPadY;
            image.drawH = imgH * (state.stageScale / 2) - cropPadX;
          }
        }
      }
    });
  },

  setCanvasDate: (data) => {
    set((state) => {
      const { stageW, stageH, stageScale, stageScaleX, stageScaleY } = data;
      if (typeof stageW === 'number') state.stageW = stageW;
      if (typeof stageH === 'number') state.stageH = stageH;
      if (typeof stageScale === 'number') state.stageScale = stageScale;
      if (typeof stageScaleX === 'number') state.stageScaleX = stageScaleX;
      if (typeof stageScaleY === 'number') state.stageScaleY = stageScaleY;
    });
  },

  setContainer: (container) => {
    get().handleResize();
    set((state) => {
      state.container = container;
    });
  },
});
