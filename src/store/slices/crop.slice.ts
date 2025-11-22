import type { CropSlice, SliceCreator } from '../editor.types';

export const createCropSlice: SliceCreator<CropSlice> = (set) => ({
  frameCrop: null,

  setCrop: (crop) => {
    set((state) => {
      state.frameCrop = crop;
      state.stageW = crop.width;
      state.stageH = crop.height;
      // Adjust widget positions to account for crop offset
      state.widgets.forEach((widget) => {
        widget.x -= crop.x;
        widget.y -= crop.y;
      });
    });
  },

  resetCrop: () => {
    set((state) => {
      if (state.frameCrop) {
        // Shift widgets back to original positions
        state.widgets.forEach((widget) => {
          widget.x += state.frameCrop!.x;
          widget.y += state.frameCrop!.y;
        });
      }
      state.frameCrop = null;
      state.stageW = 700; // Reset to default stage size
      state.stageH = 700;
    });
  },
});
