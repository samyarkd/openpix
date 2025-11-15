'use client';

// src/hooks/use-crop-frame.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import { computePaddingAndScale } from '~/store/utils/geometry';

type HandleType = 'tl' | 'tr' | 'bl' | 'br';

export const useCropFrame = () => {
  // Get initial crop and stage dimensions from the global store
  const {
    crop: initialCrop,
    setCrop,
    stageW,
    stageH,
    stageScale,
  } = useEditorStore(
    useShallow((state) => ({
      crop: state.frameCrop,
      setCrop: state.setCrop,
      stageW: computePaddingAndScale(state.stageW, state.stageScale),
      stageH: computePaddingAndScale(state.stageH, state.stageScale),
      stageScale: state.stageScale,
    }))
  );

  // Local state for the crop dimensions during interaction
  const [crop, setLocalCrop] = useState(() => initialCrop);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);

  // Refs to store values during a drag without causing re-renders
  const startDragPos = useRef({ x: 0, y: 0 });
  const startCrop = useRef(crop);

  // Update local crop if the global one changes (e.g., from a reset button)
  useEffect(() => {
    if (initialCrop) {
      // Normalize local frame to cover the current stage (start at origin)
      setLocalCrop({
        x: 0,
        y: 0,
        width: initialCrop.width,
        height: initialCrop.height,
        rotation: 0,
      });
    } else {
      setLocalCrop({ x: 0, y: 0, width: stageW, height: stageH, rotation: 0 });
    }
  }, [initialCrop, stageW, stageH]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, handle: HandleType) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveHandle(handle);
      startDragPos.current = { x: e.clientX, y: e.clientY };
      startCrop.current = crop; // Store the crop state at the beginning of the drag
    },
    [crop]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!activeHandle || !startCrop.current) return;
      e.preventDefault();

      const dx = e.clientX - startDragPos.current.x;
      const dy = e.clientY - startDragPos.current.y;

      let { x, y, width, height } = startCrop.current;

      // Adjust dimensions based on which handle is being dragged
      switch (activeHandle) {
        case 'tl':
          x += dx;
          y += dy;
          width -= dx;
          height -= dy;
          break;
        case 'tr':
          width += dx;
          y += dy;
          height -= dy;
          break;
        case 'bl':
          x += dx;
          width -= dx;
          height += dy;
          break;
        case 'br':
          width += dx;
          height += dy;
          break;
      }

      if (x < 0) {
        width += x; // shrink width
        x = 0;
      }

      if (y < 0) {
        height += y; // shrink height
        y = 0;
      }

      if (x + width > stageW) {
        width = stageW - x;
      }

      if (y + height > stageH) {
        height = stageH - y;
      }

      setLocalCrop({
        x,
        y,
        width: width,
        height: height,
        rotation: 0,
      });
    },
    [activeHandle]
  );

  const handleMouseUp = useCallback(() => {
    if (activeHandle && crop) {
      // On drag end, update the global Zustand store with the actual x/y so image shifts correctly
      setCrop(crop);
      // Normalize only the local frame to start at the new origin (0,0) with same size
      setLocalCrop({
        x: 0,
        y: 0,
        width: computePaddingAndScale(crop.width, stageScale, true),
        height: computePaddingAndScale(crop.height, stageScale, true),
        rotation: 0,
      });
      setActiveHandle(null);
    }
  }, [activeHandle, crop, setCrop]);

  // Attach global mouse listeners when a drag starts
  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup function to remove listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeHandle, handleMouseMove, handleMouseUp]);

  return { crop, handleMouseDown };
};
