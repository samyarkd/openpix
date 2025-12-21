import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';

export function useDeleteKey() {
  const { selectedWidgetIds, removeWidgets } = useEditorStore(
    useShallow((state) => ({
      selectedWidgetIds: state.selectedWidgetIds,
      removeWidgets: state.removeWidgets,
    }))
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedWidgetIds.length > 0
      ) {
        // Don't delete if user is typing in an input or textarea
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        removeWidgets(selectedWidgetIds);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWidgetIds, removeWidgets]);
}
