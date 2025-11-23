import Konva from 'konva';
import { useCallback, useRef, useState } from 'react';
import { KonvaNodeEvents } from 'react-konva';
import { findSelectableAncestor } from '~/utils/canvas-utils';

type SelectionRect = {
  visible: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/**
 * Custom hook for handling selection functionality in the canvas.
 * @param groupRefs - Reference to the map of group refs.
 * @param selectedWidgetIds - Current selected widget IDs.
 * @param setSelectedWidgetIds - Function to set selected widget IDs.
 * @returns selectionRect, handleStageMouseDown, handleStageMouseMove, handleStageMouseUp, handleStageClick
 */
export function useSelection(
  groupRefs: React.RefObject<Map<string, Konva.Group | Konva.Node>>,
  selectedWidgetIds: string[],
  setSelectedWidgetIds: (ids: string[]) => void
) {
  const isSelecting = useRef(false);

  const [selectionRect, setSelectionRect] = useState<SelectionRect>({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  // Stage event handlers
  const handleStageMouseDown: KonvaNodeEvents['onMouseDown'] = (e) => {
    const stage = e.target.getStage();
    // start selecting only if clicked on empty area
    if (e.target !== stage) return;
    isSelecting.current = true;
    const pos = stage.getPointerPosition()!;
    setSelectionRect({
      visible: true,
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const handleStageMouseMove: KonvaNodeEvents['onMouseMove'] = (e) => {
    if (!isSelecting.current) return;
    const stage = e.target.getStage();
    if (e.target !== stage) return;
    const pos = stage.getPointerPosition()!;
    setSelectionRect((prev) => ({
      ...prev,
      x2: pos.x,
      y2: pos.y,
    }));
  };

  const handleStageMouseUp: KonvaNodeEvents['onMouseUp'] = () => {
    if (!isSelecting.current) return;
    isSelecting.current = false;

    // hide selection rect a tick later so click handling can know
    setTimeout(() => {
      setSelectionRect((prev) => ({ ...prev, visible: false }));
    }, 0);

    const selBox = {
      x: Math.min(selectionRect.x1, selectionRect.x2),
      y: Math.min(selectionRect.y1, selectionRect.y2),
      width: Math.abs(selectionRect.x2 - selectionRect.x1),
      height: Math.abs(selectionRect.y2 - selectionRect.y1),
    };

    // find nodes intersecting with selection box
    const selected: string[] = [];
    groupRefs.current?.forEach((node, id) => {
      try {
        const rect = node.getClientRect(); // accounts for rotation/scale
        if (Konva.Util.haveIntersection(selBox, rect)) {
          selected.push(id);
        }
      } catch {
        // ignore nodes that can't report client rect
      }
    });

    setSelectedWidgetIds(selected);
  };

  const handleStageClick: KonvaNodeEvents['onClick'] = (e) => {
    // ignore click while selection rect is visible
    if (selectionRect.visible) return;

    const stage = e.target.getStage();
    if (e.target === stage) {
      // clicked empty area -> clear selection
      setSelectedWidgetIds([]);

      return;
    }

    // find top selectable ancestor of clicked target
    const selectable = findSelectableAncestor(e.target);
    if (!selectable) return;

    const clickedId = selectable.id();
    const metaPressed =
      e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey || e.evt.altKey;
    const isSelected = selectedWidgetIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      setSelectedWidgetIds([clickedId]);
    } else if (metaPressed && isSelected) {
      setSelectedWidgetIds(selectedWidgetIds.filter((id) => id !== clickedId));
    } else if (metaPressed && !isSelected) {
      setSelectedWidgetIds([...selectedWidgetIds, clickedId]);
    }
  };

  return {
    selectionRect,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleStageClick,
  };
}
