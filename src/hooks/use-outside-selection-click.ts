import { useEffect } from 'react';
import { useEditorStore } from '~/store/editor.store';

/**
 * Custom hook for handling outside click on selected widgets.
 * @param onOutsideClick runs when the user clicks outside of the selected widgets
 */
export function useOutsideSelectionClick(onOutsideClick: () => void) {
  const stageRef = useEditorStore((state) => state.stageRef);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !stageRef.current?.container().contains(e.target as Node) &&
        e.target instanceof HTMLElement &&
        e.target.id === 'canvas-container-page'
      ) {
        onOutsideClick();
      }
    }

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [stageRef, onOutsideClick]);
}
