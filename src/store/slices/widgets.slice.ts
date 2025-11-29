import { castDraft } from 'immer';
import { loadImage } from '~/lib/load-image';
import {
  defaultFilters,
  type ImageItem,
  type SliceCreator,
  type Widget,
  type WidgetsSlice,
} from '../editor.types';
import { computeOverlayDimensions } from '../utils/geometry';

export const createWidgetSlice: SliceCreator<WidgetsSlice> = (set, get) => ({
  /**
   * This list contains node that will be rendered inside the canvas
   */
  widgets: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          {
            type: 'text',
            text: 'Hello this is a test',
            fontSize: 72,
            fill: '#880808',
            id: crypto.randomUUID(),
            align: 'left',
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            shadowColor: '#000000',
            shadowOffsetX: 3,
            shadowEnabled: false,
            shadowOffsetY: 3,
            shadowBlur: 5,
          } as const,
        ]
      : []),
  ],
  // Selected widgets
  selectedWidgetId: null,
  selectedWidgetIds: [],
  setSelectedWidgetIds: (wIds) => {
    set((state) => {
      state.selectedWidgetIds = wIds;
      state.selectedWidgetId = wIds.length ? wIds[0] : null;
    });
  },

  /**
   * This function will add a new widget to the widgets
   * @param w Widget data
   */
  addWidget: (w) => {
    const newWidgetId = crypto.randomUUID();

    set((state) => {
      const created = { ...w, id: newWidgetId } as Widget;
      if (typeof created.x !== 'number') created.x = state.stageW / 2;
      if (typeof created.y !== 'number') created.y = state.stageH / 2;
      if (typeof created.scaleX !== 'number') created.scaleX = 1;
      if (typeof created.scaleY !== 'number') created.scaleY = 1;
      if (typeof created.rotation !== 'number') created.rotation = 0;

      state.widgets.push(castDraft(created));
    });

    get().setSelectedWidgetIds([newWidgetId]);
  },
  /**
   * Update the widget data
   * @param wId Widget Id
   * @param w widget data
   */
  updateWidget: (wId, w) => {
    set((state) => {
      const widgetIndex = state.widgets.findIndex((v) => v.id === wId);
      if (widgetIndex === -1) {
        return;
      }

      // Safely update the widget with proper type handling
      const currentWidget = state.widgets[widgetIndex];
      state.widgets[widgetIndex] = { ...currentWidget, ...w };
    });
  },
  /**
   * This function will remove the widget from the widgets
   * @param wId Widget Id
   */
  removeWidget: (wId) => {
    set((state) => {
      state.widgets = state.widgets.filter((w) => w.id !== wId);
      state.setSelectedWidgetIds([]);
    });
  },
  /**
   * Updates the transformation properties of a widget with the given id.
   *
   * @param id The id of the widget to update.
   * @param transform The new transformation properties.
   * Only the properties specified in the object will be updated.
   */
  updateWidgetTransform: (id, transform) => {
    set((state) => {
      const widget = state.widgets.find((w) => w.id === id);
      if (!widget) return;
      widget.x = transform.x ?? widget.x;
      widget.y = transform.y ?? widget.y;
      widget.scaleX = transform.scaleX ?? widget.scaleX;
      widget.scaleY = transform.scaleY ?? widget.scaleY;
      widget.rotation = transform.rotation ?? widget.rotation;
    });
  },

  /**
   * Add a new image widget to the widgets
   * @param imgUrl URL of the image
   */
  addImageWidget: async (imgUrl) => {
    try {
      const state = get();
      const loadedImg = await loadImage(imgUrl, { crossOrigin: 'anonymous' });

      const imgW = loadedImg?.width || 0;
      const imgH = loadedImg?.height || 0;

      const imgObj: ImageItem = {
        type: 'image',
        // the id will be overwritten (it's invalid)
        id: crypto.randomUUID(),
        img: loadedImg,
        filters: defaultFilters,
        drawW: 0,
        drawH: 0,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      };

      // other new images will be scaled down
      const { drawW, drawH } = computeOverlayDimensions(
        imgW,
        imgH,
        state.stageScale
      );
      imgObj.drawW = drawW;
      imgObj.drawH = drawH;

      // Center the image on the canvas
      imgObj.x = (state.stageW - drawW) / 2;
      imgObj.y = (state.stageH - drawH) / 2;

      state.addWidget(imgObj);

      if (imgUrl.startsWith('blob:')) URL.revokeObjectURL(imgUrl);
    } catch (error) {
      console.error('Failed to load the image', error);
    }
  },

  /**
   * Update image filters
   */
  setImageFilters: (id, filters) => {
    set((state) => {
      const images = state.widgets.filter((w) => w.type === 'image');
      const image = images.find((f) => f.id === id);
      if (!image) return;
      for (const key of Object.keys(
        filters
      ) as (keyof ImageItem['filters'])[]) {
        image.filters[key] = filters[key] ?? image.filters[key];
      }
    });
  },

  // Layer ordering
  moveWidgetUp: (id) => {
    set((state) => {
      const index = state.widgets.findIndex((w) => w.id === id);
      if (index < state.widgets.length - 1) {
        const temp = state.widgets[index];
        state.widgets[index] = state.widgets[index + 1];
        state.widgets[index + 1] = temp;
      }
    });
  },

  moveWidgetDown: (id) => {
    set((state) => {
      const index = state.widgets.findIndex((w) => w.id === id);
      if (index > 0) {
        const temp = state.widgets[index];
        state.widgets[index] = state.widgets[index - 1];
        state.widgets[index - 1] = temp;
      }
    });
  },

  moveWidgetToFront: (id) => {
    set((state) => {
      const index = state.widgets.findIndex((w) => w.id === id);
      if (index !== -1) {
        const widget = state.widgets.splice(index, 1)[0];
        state.widgets.push(widget);
      }
    });
  },

  moveWidgetToBack: (id) => {
    set((state) => {
      const index = state.widgets.findIndex((w) => w.id === id);
      if (index !== -1) {
        const widget = state.widgets.splice(index, 1)[0];
        state.widgets.unshift(widget);
      }
    });
  },
});
