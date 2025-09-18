import type { SliceCreator } from '../editor.types';
import type { Crop } from '../editor.types';

export const createCropSlice: SliceCreator<{
  frameCrop: Crop | null;
  isCropping: boolean;
  setCrop: (crop: Crop) => void;
  setCropping: (value: boolean) => void;
  resetCrop: () => void;
}> = (set) => ({
  frameCrop: null,
  isCropping: false,

  setCrop: (crop) => {
    set((state) => {
      state.frameCrop = crop;
    });
  },

  setCropping: (value) => {
    set((state) => {
      state.isCropping = value;
    });
  },

  resetCrop: () => {
    set((state) => {
      state.frameCrop = null;
    });
  },
});
