import { castDraft, WritableDraft } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { loadImage } from '~/lib/load-image';

/**
 * EditorTab represents the currently selected editor tool tab.
 */
export type EditorTab = 'enhance' | 'crop' | 'type' | 'brush' | 'sticker';

interface EditorTabContextType {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
}

export type FiltersState = {
  // Common adjustable filters
  blurRadius: number; // 0..100
  brightness: number; // -1..1 (0 = none)
  contrast: number; // -100..100 (0 = none)
  enhance: number; // 0..1
  noise: number; // 0..1
  pixelSize: number; // >= 1
  threshold: number; // 0..1
  // Color channels
  red: number; // 0..255
  green: number; // 0..255
  blue: number; // 0..255
  alpha: number; // 0..1
  // HSL / HSV
  hue: number; // -180..180
  saturation: number; // -2..2 (0 = none) - practical range
  luminance: number; // -1..1 (HSL)
  value: number; // 0..255 (HSV value)
};

export type ImageItem = {
  id: string;
  img: HTMLImageElement;
  drawW: number;
  drawH: number;
  filters: FiltersState;
};

export type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type Container = { width: number; height: number };

type CanvasData = {
  stageW: number;
  stageH: number;
  stageScaleX: number;
  stageScaleY: number;
  stageScale: number;
};

type State = CanvasData &
  EditorTabContextType & {
    images: ImageItem[];
    rootImage: ImageItem | null;
    activeImageId: string | null;
    frameCrop: Crop | null;
    isCropping: boolean;
    container: Container;
  };

type Actions = {
  addImage: (imgUrl: string) => void;
  setCanvasDate: (data: Partial<CanvasData>) => void;
  setCrop: (crop: Crop) => void;
  setCropping: (value: boolean) => void;
  setContainer: (container: Container) => void;
  handleResize: () => void;
  resetCrop: () => void;
  setImageFilters: (id: string, filters: Partial<FiltersState>) => void;
  setActiveImage: (id: string | null) => void;
};

export const defaultFilters: FiltersState = {
  blurRadius: 0,
  brightness: 0,
  contrast: 0,
  enhance: 0,
  noise: 0,
  pixelSize: 0,
  threshold: 0,
  red: 0,
  green: 0,
  blue: 0,
  alpha: 1,
  hue: 0,
  saturation: 0,
  luminance: 0,
  value: 0,
};

const CROP_SIZE = 30;

export const useEditorStore = create<State & Actions>()(
  devtools(
    immer((set, get) => ({
      // --- State
      images: [],
      rootImage: null,
      stageW: 0,
      stageH: 0,
      stageScale: 0,
      stageScaleX: 0,
      stageScaleY: 0,
      frameCrop: null,
      isCropping: false,
      container: { height: 0, width: 0 },
      activeTab: 'enhance',
      activeImageId: null,

      // --- Actions
      addImage: async (imgUrl) => {
        try {
          const loadedImg = castDraft(
            await loadImage(imgUrl, {
              crossOrigin: 'anonymous',
            })
          );

          const imgW = loadedImg?.width || 0;
          const imgH = loadedImg?.height || 0;

          const imgObj: WritableDraft<ImageItem> = castDraft({
            id: crypto.randomUUID(),
            img: loadedImg,
            filters: defaultFilters,
            drawW: 0,
            drawH: 0,
          });

          set((state) => {
            const imgCount = state.images.length;

            if (imgCount === 0) {
              const containerH = state.container.height;
              const containerW = state.container.width;

              const stageScaleX = containerW / imgW;
              const stageScaleY = containerH / imgH;
              const stageScale =
                imgW && imgH && containerW && containerH
                  ? Math.min(stageScaleX, stageScaleY)
                  : 1;

              const cropPadX =
                state.activeTab === 'crop' ? CROP_SIZE * stageScaleX : 0;
              const cropPadY =
                state.activeTab === 'crop' ? CROP_SIZE * stageScaleY : 0;

              const stageW = imgW * stageScale - cropPadY;
              const stageH = imgH * stageScale - cropPadX;

              imgObj.drawW = imgW * stageScale - cropPadY;
              imgObj.drawH = imgH * stageScale - cropPadX;

              // set root data
              state.stageScale = stageScale;
              state.stageScaleX = stageScaleX;
              state.stageScaleY = stageScaleY;
              state.stageW = stageW;
              state.stageH = stageH;

              state.rootImage = imgObj;
            } else {
              const cropPadX =
                state.activeTab === 'crop' ? CROP_SIZE * state.stageScaleY : 0;
              const cropPadY =
                state.activeTab === 'crop' ? CROP_SIZE * state.stageScaleX : 0;
              // other new images will be scaled down
              imgObj.drawW = imgW * (state.stageScale / 2) - cropPadX;
              imgObj.drawH = imgH * (state.stageScale / 2) - cropPadY;
            }

            state.images.push(imgObj);
          });

          if (imgUrl.startsWith('blob:')) URL.revokeObjectURL(imgUrl);
        } catch (error) {
          console.error('Failed to load the image', error);
        }
      },

      handleResize: () => {
        set((state) => {
          for (let idx = 0; idx < state.images.length; idx++) {
            const image = state.images[idx];

            const imgW = image.img?.width || 0;
            const imgH = image.img?.height || 0;

            if (idx === 0) {
              const containerH = state.container.height;
              const containerW = state.container.width;

              const stageScaleX = containerW / imgW;
              const stageScaleY = containerH / imgH;
              const stageScale =
                imgW && imgH && containerW && containerH
                  ? Math.min(stageScaleX, stageScaleY)
                  : 1;

              const cropPadX =
                state.activeTab === 'crop' ? CROP_SIZE * stageScaleX : 0;
              const cropPadY =
                state.activeTab === 'crop' ? CROP_SIZE * stageScaleY : 0;

              const stageW = imgW * stageScale - cropPadY;
              const stageH = imgH * stageScale - cropPadX;

              const drawW = imgW * stageScale - cropPadY;
              const drawH = imgH * stageScale - cropPadX;

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
              const cropPadX =
                state.activeTab === 'crop' ? CROP_SIZE * state.stageScaleX : 0;
              const cropPadY =
                state.activeTab === 'crop' ? CROP_SIZE * state.stageScaleY : 0;
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
          for (const key of Object.keys(data) as (keyof CanvasData)[]) {
            state[key] = data[key] ?? state[key];
          }
        });
      },

      setContainer: (container) => {
        get().handleResize();
        set((state) => {
          state.container = container;
        });
      },

      setCrop(crop) {
        set((state) => {
          state.frameCrop = crop;
        });
      },

      setCropping(value) {
        set((state) => {
          state.isCropping = value;
        });
      },

      resetCrop: () => {
        set((state) => {
          state.frameCrop = null;
        });
      },
      setActiveTab: (tab) => {
        set((state) => {
          state.activeTab = tab;
        });
      },
      setImageFilters: (id, filters) => {
        set((state) => {
          const image =
            state.images[state.images.findIndex((f) => f.id === id)];

          if (!image) {
            return;
          }

          for (const key of Object.keys(filters) as (keyof FiltersState)[]) {
            image.filters[key] = filters[key] ?? image.filters[key];
          }
        });
      },
      setActiveImage: (id) => {
        set((state) => {
          if (id) {
            state.activeImageId = id;
          } else {
            state.activeImageId = null;
          }
        });
      },
    }))
  )
);
