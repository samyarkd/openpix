import Konva from 'konva';
import { useCallback } from 'react';
import { KonvaNodeEvents } from 'react-konva';
import { findSelectableAncestor } from '~/utils/canvas-utils';

/**
 * Custom hook for handling drag and transform events.
 * @param updateWidgetTransform - Function to update widget transform.
 * @returns handleDragEnd, handleTransformEnd
 */
export function useDragTransform(
  updateWidgetTransform: (id: string, transform: any) => void
) {
  /**
   * Handles drag end events, clearing guides and updating transform.
   */
  const handleDragEnd: KonvaNodeEvents['onDragEnd'] = (e) => {
    const layer = e.target.getLayer();
    if (layer) {
      // clear all previous lines on the screen
      layer.find('.guid-line').forEach((l: any) => l.destroy());
    }

    const node = e.target as Konva.Node;
    const id = node.id();
    const selectable = findSelectableAncestor(node) ?? node;
    const x = selectable.x();
    const y = selectable.y();

    updateWidgetTransform(id, { x, y });
  };

  const handleTransformEnd: KonvaNodeEvents['onTransformEnd'] = (e) => {
    const node = e.target as Konva.Node;
    const id = node.id();
    const selectable = findSelectableAncestor(node) ?? node;

    const scaleX = selectable.scaleX();
    const scaleY = selectable.scaleY();
    const rotation = selectable.rotation();
    const x = selectable.x();
    const y = selectable.y();

    // After persisting scale, normalize node scale back to 1 to avoid compounding
    selectable.scaleX(1);
    selectable.scaleY(1);

    updateWidgetTransform(id, { x, y, scaleX, scaleY, rotation });

    selectable.getLayer()?.batchDraw();
  };

  return { handleDragEnd, handleTransformEnd };
}
