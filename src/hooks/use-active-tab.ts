import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';

export const useActiveTab = () => {
  return useEditorStore(
    useShallow((s) => ({
      activeTab: s.selectedWidgetId ? 'active-widget' : s.activeTab,
      setActiveTab: s.setActiveTab,
    }))
  );
};
