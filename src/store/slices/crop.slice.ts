import type { CropSlice, SliceCreator } from '../editor.types';

export const createCropSlice: SliceCreator<CropSlice> = (set) => ({
  frameCrop: null,

  setCrop: (crop) => {
    set((state) => {
      state.frameCrop = crop;
      state.stageH = crop.height;
      state.stageW = crop.width;
    });
  },

  resetCrop: () => {
    set((state) => {
      state.frameCrop = null;
    });
  },
});
