import { castDraft } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { loadImage } from '~/lib/load-image';

export type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type CanvasData = {
  stageW: number;
  stageH: number;
  imgW: number;
  imgH: number;
  drawW: number;
  drawH: number;
  offsetX: number;
  offsetY: number;
};

type State = CanvasData & {
  images: HTMLImageElement[];
  image: HTMLImageElement | null;
  crop: Crop | null;
  isCropping: boolean;
};

type Actions = {
  addImage: (imgUrl: string) => void;
  setImage: (img: HTMLImageElement) => void;
  setCanvasDate: (data: Partial<CanvasData>) => void;
  setCrop: (crop: Crop) => void;
  setCropping: (value: boolean) => void;
  resetCrop: () => void;
};

export const useEditorStore = create<State & Actions>()(
  immer((set) => ({
    // --- State
    images: [],
    image: null,
    stageW: 0,
    stageH: 0,
    imgW: 0,
    imgH: 0,
    drawW: 0,
    drawH: 0,
    offsetX: 0,
    offsetY: 0,
    crop: null,
    isCropping: false,

    // --- Actions
    addImage: async (imgUrl) => {
      try {
        const loadedImg = castDraft(
          await loadImage(imgUrl, {
            crossOrigin: 'anonymous',
          })
        );

        set((state) => {
          const imgCount = state.images.length;
          if (imgCount === 0) {
            state.image = loadedImg;
          }
          state.images.push(loadedImg);
        });

        if (imgUrl.startsWith('blob:')) URL.revokeObjectURL(imgUrl);
      } catch (error) {
        console.error('Failed to load the image', error);
      }
    },
    setImage: (img) => {
      set((state) => {
        state.image = castDraft(img);
      });
    },

    setCanvasDate: (data) => {
      set((state) => {
        for (const key of Object.keys(data) as (keyof CanvasData)[]) {
          state[key] = data[key] ?? state[key];
        }
      });
    },

    setCrop(crop) {
      set((state) => {
        state.crop = crop;
      });
    },

    setCropping(value) {
      set((state) => {
        state.isCropping = value;
      });
    },
    resetCrop: () => {
      set((state) => {
        state.crop = null;
      });
    },
  }))
);
