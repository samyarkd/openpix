import type { SliceCreator } from '../editor.types';
import { type CanvasSlice } from '../editor.types';
import { computeStageScale } from '../utils/geometry';

export const createCanvasSlice: SliceCreator<CanvasSlice> = (set) => ({
  // CanvasData
  stageW: 700,
  stageH: 700,
  stageScale: 1,

  container: { height: 0, width: 0 },

  setContainer: (container) => {
    set((state) => {
      // state.container = container;

      state.container = {
        height: container.height - 10,
        width: container.width - 10,
      };

      const scale = computeStageScale(
        state.container.width,
        state.container.height,
        state.stageW,
        state.stageH
      );

      state.stageScale = scale;
    });
  },
});
