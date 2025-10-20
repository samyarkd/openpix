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
  const trRef = useRef<Konva.Transformer | null>(null);

  const imageRefs = useRef<Map<string, Konva.Group | Konva.Node>>(new Map());
  const isSelecting = useRef(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const { frameCrop, images, stageH, stageW } = useEditorStore(
    useShallow((state) => ({
      stageW: state.stageW,
      stageH: state.stageH,
      frameCrop: state.frameCrop,
      // image
      images: state.images,
    }))
  );

  // Keep Konva stage size in sync
  useEffect(() => {
    const stage = stageRef.current as Konva.Stage | null;
    if (stage) {
      if (typeof stageW === 'number') stage.width(stageW);
      if (typeof stageH === 'number') stage.height(stageH);
      stage.batchDraw();
    }
  }, [stageW, stageH, stageRef]);

  // Update transformer nodes when selection changes
  useEffect(() => {
    if (!trRef.current) return;
    if (selectedIds.length) {
      const nodes = selectedIds
        .map((id) => imageRefs.current.get(id))
        .filter(Boolean) as Konva.Node[];
      trRef.current.nodes(nodes);
    } else {
      trRef.current.nodes([]);
    }
    trRef.current.getLayer()?.batchDraw();
  }, [selectedIds]);

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
    imageRefs.current.forEach((node, id) => {
      try {
        const rect = node.getClientRect(); // accounts for rotation/scale
        if (Konva.Util.haveIntersection(selBox, rect)) {
          selected.push(id);
        }
      } catch {
        // ignore nodes that can't report client rect
      }
    });

    setSelectedIds(selected);
  };

  const handleStageClick: KonvaNodeEvents['onClick'] = (e) => {
    // ignore click while selection rect is visible
    if (selectionRect.visible) return;

    const stage = e.target.getStage();
    if (e.target === stage) {
      // clicked empty area -> clear selection
      setSelectedIds([]);
      return;
    }

    // find top selectable ancestor of clicked target
    const selectable = findSelectableAncestor(e.target);
    if (!selectable) return;

    const clickedId = selectable.id();
    const metaPressed =
      e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey || e.evt.altKey;
    const isSelected = selectedIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      setSelectedIds([clickedId]);
    } else if (metaPressed && isSelected) {
      setSelectedIds((s) => s.filter((id) => id !== clickedId));
    } else if (metaPressed && !isSelected) {
      setSelectedIds((s) => [...s, clickedId]);
    }
  };

  // Optional: handlers for drag/transform end — currently only visual.
  // If you want transforms persisted to your editor store, call your store setters here.
  const handleDragEnd: KonvaNodeEvents['onDragEnd'] = (e) => {
    // e.target is the transformed Group
    // you can update the store here if needed
  };

  const handleTransformEnd: KonvaNodeEvents['onTransformEnd'] = (e) => {
    // e.target is the transformed Group
    // you can update the store with new x,y,scale,rotation,width,height if needed
    // example:
    // const node = e.target;
    // const id = node.id();
    // const scaleX = node.scaleX();
    // const scaleY = node.scaleY();
    // node.scaleX(1); node.scaleY(1);
    // const width = (node.width ? node.width() : 0) * scaleX;
    // const height = (node.height ? node.height() : 0) * scaleY;
    // updateEditorStoreImage(id, { x: node.x(), y: node.y(), width, height, rotation: node.rotation() })
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
              ref={(node) => {
                if (node) imageRefs.current.set(image.id, node);
                else imageRefs.current.delete(image.id);
              }}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
            >
              <ImageWithFilters image={image} />
            </Group>
          ))}

          {/* Example Text as selectable as well (optional) */}
          <Group
            id="text-sample"
            name="selectable"
            draggable
            ref={(node) => {
              if (node) imageRefs.current.set('text-sample', node);
              else imageRefs.current.delete('text-sample');
            }}
          >
            <Text
              text="Sample text"
              fontSize={24}
              align="center"
              fill={'#fff'}
            />
          </Group>
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
