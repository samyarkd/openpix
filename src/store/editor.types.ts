import type { StateCreator } from 'zustand';
import { HexColor } from '../../types';

// Editor Tabs
export type EditorTab =
  | 'active-widget'
  | 'enhance'
  | 'crop'
  | 'type'
  | 'brush'
  | 'sticker'
  | 'layers';

export type Transform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

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

export type ImageItem = WidgetBase & {
  type: 'image';
  id: string;
  img: HTMLImageElement;
  drawW: number;
  drawH: number;
  filters: FiltersState;
} & Transform;

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
  stageScale: number;
};

export const CROP_SIZE = 30;

// Slice state/action contracts
export type CanvasSlice = CanvasData & {
  container: Container;
  setContainer: (container: Container) => void;
};

export type CropSlice = {
  frameCrop: Crop | null;
  setCrop: (crop: Crop) => void;
  resetCrop: () => void;
};

export type WidgetBase = Transform & {
  id: string;
};

export type TextWidget = WidgetBase & {
  type: 'text';
  text: string;
  fill: HexColor;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  // font
  fontStyle?: 'italic' | 'bold' | 'normal' | 'italic bold';
  fontFamily?: string;
  textDecoration?: 'line-through' | 'underline';
  // stroke
  strokeColor?: HexColor;
  strokeWidth?: number;
  // shadow
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowColor: HexColor;
  shadowOffsetX: number;
  shadowOffsetY: number;
};

export type StickerWidget = WidgetBase & {
  type: 'sticker';
};

export type Widget = TextWidget | StickerWidget | ImageItem;

export type WidgetMap = {
  text: TextWidget;
  sticker: StickerWidget;
  image: ImageItem;
};

export type WidgetType = Widget['type'];

// New widget input typed by discriminant
export type NewWidget<T extends WidgetType> = Omit<
  WidgetMap[T],
  'id' | keyof Transform
> &
  Partial<Transform>;

export type WidgetsSlice = {
  // Widgets
  widgets: Widget[];

  // selected widgets
  selectedWidgetId: string | null;
  selectedWidgetIds: string[];
  setSelectedWidgetIds: (wIds: string[]) => void;

  // Add, update, remove and transform
  addWidget: <T extends WidgetType>(w: NewWidget<T>) => void;
  updateWidget: <T extends WidgetType>(
    wId: string,
    w: Partial<NewWidget<T>>
  ) => void;
  removeWidget: (wId: string) => void;
  updateWidgetTransform: (id: string, transform: Partial<Transform>) => void;

  // Image specific
  addImageWidget: (imgUrl: string) => void;
  setImageFilters: (id: string, filters: Partial<FiltersState>) => void;

  // Layer ordering
  moveWidgetUp: (id: string) => void;
  moveWidgetDown: (id: string) => void;
  moveWidgetToFront: (id: string) => void;
  moveWidgetToBack: (id: string) => void;
};

export type UiSlice = {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;

  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
};

// ------------ Full store ------------------
export type EditorStore = CanvasSlice & CropSlice & UiSlice & WidgetsSlice;

// Zustand middleware tuple used by slices
export type WithMiddleware = [
  ['zustand/devtools', never],
  ['zustand/immer', never],
];

// Helper type for slices
export type SliceCreator<T> = StateCreator<EditorStore, WithMiddleware, [], T>;
