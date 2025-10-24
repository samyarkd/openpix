'use client';

import Konva from 'konva';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Group,
  KonvaNodeEvents,
  Layer,
  Rect,
  Stage,
  Text,
  Transformer,
} from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import StageCropFrame from './editor-tabs/crop/stage-crop-frame';
import ImageWithFilters from './image-with-filters';

type CanvasProps = {
  stageRef: React.RefObject<Konva.Stage | null>;
};

function CanvasGround({ stageRef }: CanvasProps) {
  const {
    frameCrop,
    images,
    stageH,
    stageW,
    widgets,
    setSelectedWidgetIds,
    selectedWidgetIds,
    activeTab,
  } = useEditorStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      stageW: state.stageW,
      stageH: state.stageH,
      frameCrop: state.frameCrop,
      // image
      images: state.images,
      widgets: state.widgets,

      // selectedWIdgets
      selectedWidgetIds: state.selectedWidgetIds,
      setSelectedWidgetIds: state.setSelectedWidgetIds,
    }))
  );

  const trRef = useRef<Konva.Transformer | null>(null);

  const groupRefs = useRef<Map<string, Konva.Group | Konva.Node>>(new Map());
  const isSelecting = useRef(false);

  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const updateImageTransform = useEditorStore((s) => s.updateImageTransform);
  const updateWidgetTransform = useEditorStore((s) => s.updateWidgetTransform);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !stageRef.current?.container().contains(e.target as Node) &&
        e.target instanceof HTMLElement &&
        e.target.id === 'canvas-container-page'
      ) {
        setSelectedWidgetIds([]);
      }
    }
    // Clear selection when clicking outside of canvas
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Keep Konva stage size in sync
  useEffect(() => {
    const stage = stageRef.current as Konva.Stage | null;
    if (!stage) {
      return;
    }
    if (typeof stageW === 'number') stage.width(stageW);
    if (typeof stageH === 'number') stage.height(stageH);
    stage.batchDraw();
  }, [stageW, stageH, stageRef]);

  // Update transformer nodes when selection changes
  useEffect(() => {
    if (!trRef.current) return;
    if (selectedWidgetIds.length) {
      const nodes = selectedWidgetIds
        .map((id) => groupRefs.current.get(id))
        .filter(Boolean) as Konva.Node[];
      trRef.current.nodes(nodes);
    } else {
      trRef.current.nodes([]);
    }

    trRef.current?.getLayer()?.batchDraw();
  }, [selectedWidgetIds, activeTab]);

  // Helpers to find selectable ancestor (Group with name 'selectable')
  const findSelectableAncestor = useCallback((node: Konva.Node | null) => {
    while (node && node.getType() !== 'Stage') {
      if (node.name && node.name() === 'selectable') return node;
      node = node.getParent();
    }
    return null;
  }, []);

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

  const handleStageMouseUp: KonvaNodeEvents['onMouseUp'] = (e) => {
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
    groupRefs.current.forEach((node, id) => {
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

  // Optional: handlers for drag/transform end — currently only visual.
  // If you want transforms persisted to your editor store, call your store setters here.
  const handleDragEnd: KonvaNodeEvents['onDragEnd'] = (e) => {
    const node = e.target as Konva.Node;
    const id = node.id();
    const selectable = findSelectableAncestor(node) ?? node;
    const x = selectable.x();
    const y = selectable.y();
    // persist for either image or widget by id
    const isImage = images.some((img) => img.id === id);
    if (isImage) updateImageTransform(id, { x, y });
    else updateWidgetTransform(id, { x, y });
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

    const isImage = images.some((img) => img.id === id);
    if (isImage) updateImageTransform(id, { x, y, scaleX, scaleY, rotation });
    else updateWidgetTransform(id, { x, y, scaleX, scaleY, rotation });

    selectable.getLayer()?.batchDraw();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: frameCrop?.width ?? stageW,
        height: frameCrop?.height ?? stageH,
      }}
    >
      <Stage
        width={frameCrop?.width ?? stageW}
        height={frameCrop?.height ?? stageH}
        ref={stageRef}
        key={`${stageW}x${stageH}`}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Images: each wrapped in a selectable Group with its own ref */}
          {images.map((image) => (
            <Group
              id={image.id}
              key={image.id}
              name="selectable"
              draggable
              x={image.x}
              y={image.y}
              scaleX={image.scaleX}
              scaleY={image.scaleY}
              rotation={image.rotation}
              ref={(node) => {
                if (node) groupRefs.current.set(image.id, node);
                else groupRefs.current.delete(image.id);
              }}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
            >
              <ImageWithFilters image={image} />
            </Group>
          ))}

          {/* Dynamically rendered widgets (nodes) */}
          {widgets.map((w) => {
            if (w.type === 'text') {
              return (
                <Group
                  name="selectable"
                  key={w.id}
                  id={w.id}
                  draggable
                  x={w.x}
                  y={w.y}
                  scaleX={w.scaleX}
                  scaleY={w.scaleY}
                  rotation={w.rotation}
                  ref={(node) => {
                    if (node) groupRefs.current.set(w.id, node);
                    else groupRefs.current.delete(w.id);
                  }}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={handleTransformEnd}
                >
                  <Text
                    align={w.align}
                    text={w.text}
                    fontSize={w.fontSize}
                    fill={w.fill}
                    fontStyle={w.fontStyle}
                    fontFamily={w.fontFamily}
                    textDecoration={w.textDecoration}
                    stroke={w.strokeColor}
                    strokeWidth={w.strokeWidth}
                    shadowEnabled={w.shadowEnabled}
                    shadowBlur={w.shadowBlur}
                    shadowColor={w.shadowColor}
                    shadowOffsetX={w.shadowOffsetX}
                    shadowOffsetY={w.shadowOffsetY}
                  />
                </Group>
              );
            } else {
              return null;
            }
          })}
        </Layer>

        <Layer>
          <Transformer
            ref={trRef}
            rotateEnabled
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'middle-left',
              'middle-right',
              'top-center',
              'bottom-center',
            ]}
          />
        </Layer>

        {/* Selection rectangle */}
        {selectionRect.visible && (
          <Layer>
            <Rect
              x={Math.min(selectionRect.x1, selectionRect.x2)}
              y={Math.min(selectionRect.y1, selectionRect.y2)}
              width={Math.abs(selectionRect.x2 - selectionRect.x1)}
              height={Math.abs(selectionRect.y2 - selectionRect.y1)}
              fill="rgba(0, 90, 255, 0.15)"
              stroke="rgba(0,90,255,0.6)"
              dash={[4, 4]}
            />
          </Layer>
        )}
      </Stage>

      {/* Canvas Resize/Crop frame */}
      <StageCropFrame />
    </div>
  );
}

export default CanvasGround;
