import type { SliceCreator } from '../editor.types';
import type { EditorTab } from '../editor.types';

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
