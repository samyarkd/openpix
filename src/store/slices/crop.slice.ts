import type { CropSlice, SliceCreator } from '../editor.types';

export const createCropSlice: SliceCreator<CropSlice> = (set) => ({
  frameCrop: null,

  setCrop: (crop) => {
    set((state) => {
      state.frameCrop = crop;
    });
  },

  resetCrop: () => {
    set((state) => {
      state.frameCrop = null;
    });
  },
});
