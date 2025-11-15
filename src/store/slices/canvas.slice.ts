import type { SliceCreator } from '../editor.types';
import { type CanvasSlice } from '../editor.types';
import { computeStageScale } from '../utils/geometry';

export const createCanvasSlice: SliceCreator<CanvasSlice> = (set, get) => ({
  // CanvasData
  stageW: 700,
  stageH: 700,
  stageScale: 1,

  container: { height: 0, width: 0 },

  /**
   * Runs every time stage or container size changes
   */
  handleResize: () => {
    set((state) => {
      // Root image should fit the stage
      const scale = computeStageScale(
        state.container.width,
        state.container.height,
        state.stageW,
        state.stageH
      );

      state.stageScale = scale;
    });
  },

  setCanvasDate: (data) => {
    set((state) => {
      const { stageW, stageH, stageScale } = data;
      if (typeof stageW === 'number') state.stageW = stageW;
      if (typeof stageH === 'number') state.stageH = stageH;
      if (typeof stageScale === 'number') state.stageScale = stageScale;
    });
  },

  setContainer: (container) => {
    get().handleResize();
    set((state) => {
      state.container = container;
    });
  },
});
