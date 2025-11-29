import type { SliceCreator, UiSlice } from '../editor.types';

export const createUiSlice: SliceCreator<UiSlice> = (set, get) => ({
  activeTab: 'enhance',

  /**
   * When we have an item selected we will not change the active tab,
   * because we will show the controls for that item instead
   *
   * @see <ActiveWidgetSettings />
   */
  setActiveTab: (tab) => {
    const s = get();
    if (s.selectedWidgetId) {
      // when changing tabs we will remove selections
      get().setSelectedWidgetIds([]);
    }

    set((state) => {
      state.activeTab = tab;
    });
  },

  snapEnabled: true,

  setSnapEnabled: (enabled) => {
    set((state) => {
      state.snapEnabled = enabled;
    });
  },
});
