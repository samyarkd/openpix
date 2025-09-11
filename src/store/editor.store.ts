import { castDraft } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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
  image: HTMLImageElement | null;
};

type Actions = {
  setImage: (img: HTMLImageElement) => void;
  setCanvasDate: (data: Partial<CanvasData>) => void;
};

export const useEditorStore = create<State & Actions>()(
  immer((set) => ({
    // --- State
    image: null,
    stageW: 0,
    stageH: 0,
    imgW: 0,
    imgH: 0,
    drawW: 0,
    drawH: 0,
    offsetX: 0,
    offsetY: 0,
    // --- Actions
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
  }))
);
