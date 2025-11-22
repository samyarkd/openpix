import type { EditorTab, SliceCreator } from '../editor.types';

export const createUiSlice: SliceCreator<{
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
}> = (set) => ({
  activeTab: 'enhance',
  setActiveTab: (tab) => {
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
