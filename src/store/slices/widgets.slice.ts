import type { SliceCreator, Widget, WidgetsSlice } from '../editor.types';

export const createWidgetSlice: SliceCreator<WidgetsSlice> = (set) => ({
  /**
   * This list contains node that will be rendered inside the canvas
   */
  widgets: [
    {
      type: 'text',
      text: 'Hello this is a test',
      fontSize: 72,
      fill: '#880808',
      id: crypto.randomUUID(),
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    },
  ],
  /**
   * This function will add a new widget to the widgets
   * @param w Widget data
   */
  addWidget: (w) => {
    set((state) => {
      const created = { id: crypto.randomUUID(), ...w } as Widget;
      if (typeof created.x !== 'number') created.x = 0;
      if (typeof created.y !== 'number') created.y = 0;
      if (typeof created.scaleX !== 'number') created.scaleX = 1;
      if (typeof created.scaleY !== 'number') created.scaleY = 1;
      if (typeof created.rotation !== 'number') created.rotation = 0;
      state.widgets.push(created);
    });
  },
  /**
   * This function will remove the widget from the widgets
   * @param wId Widget Id
   */
  removeWidget: (wId) => {
    set((state) => {
      state.widgets = state.widgets.filter((w) => w.id !== wId);
    });
  },
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
});
