import type { StateCreator } from 'zustand';

// Editor Tabs
export type EditorTab = 'enhance' | 'crop' | 'type' | 'brush' | 'sticker';

export interface EditorTabContextType {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
}

// Filters
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

export type Container = { width: number; height: number };

export type CanvasData = {
  stageW: number;
  stageH: number;
  stageScaleX: number;
  stageScaleY: number;
  stageScale: number;
};

export const CROP_SIZE = 30;

// Slice state/action contracts
export type CanvasSlice = CanvasData & {
  container: Container;
  setCanvasDate: (data: Partial<CanvasData>) => void;
  setContainer: (container: Container) => void;
  handleResize: () => void;
};

export type CropSlice = {
  frameCrop: Crop | null;
  setCrop: (crop: Crop) => void;
  resetCrop: () => void;
};

export type ImagesSlice = {
  images: ImageItem[];
  rootImage: ImageItem | null;
  activeImageId: string | null;
  addImage: (imgUrl: string) => void;
  setImageFilters: (id: string, filters: Partial<FiltersState>) => void;
  setActiveImage: (id: string | null) => void;
};

export type UiSlice = EditorTabContextType;

// Full store
export type EditorStore = CanvasSlice & CropSlice & ImagesSlice & UiSlice;

// Zustand middleware tuple used by slices
export type WithMiddleware = [
  ['zustand/devtools', never],
  ['zustand/immer', never],
];

// Helper type for slices
export type SliceCreator<T> = StateCreator<EditorStore, WithMiddleware, [], T>;
