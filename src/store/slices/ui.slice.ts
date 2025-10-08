import type { EditorTab, SliceCreator } from '../editor.types';

export const createUiSlice: SliceCreator<{
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
}> = (set) => ({
  activeTab: 'enhance',
  setActiveTab: (tab) => {
    set((state) => {
      state.activeTab = tab;
    });
  },
});
