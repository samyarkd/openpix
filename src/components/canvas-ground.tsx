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
import { computePaddingAndScale } from '~/store/utils/geometry';
import StageCropFrame from './editor-tabs/crop/stage-crop-frame';
import ImageWithFilters from './image-with-filters';
import { GridPattern } from './magicui/grid-pattern';

const GUIDELINE_OFFSET = 5;

type Snap = 'start' | 'center' | 'end';
type SnappingEdges = {
  vertical: Array<{
    guide: number;
    offset: number;
    snap: Snap;
  }>;
  horizontal: Array<{
    guide: number;
    offset: number;
    snap: Snap;
  }>;
};

type CanvasProps = {
  stageRef: React.RefObject<Konva.Stage | null>;
};

function CanvasGround({ stageRef }: CanvasProps) {
  const {
    stageH,
    stageW,
    stageScale,
    widgets,

    setSelectedWidgetIds,
    selectedWidgetIds,
    activeTab,
    snapEnabled,
  } = useEditorStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      stageW: state.stageW,
      stageH: state.stageH,
      stageScale: state.stageScale,
      // image
      widgets: state.widgets,

      // selectedWIdgets
      selectedWidgetIds: state.selectedWidgetIds,
      setSelectedWidgetIds: state.setSelectedWidgetIds,
      snapEnabled: state.snapEnabled,
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

  const updateWidgetTransform = useEditorStore((s) => s.updateWidgetTransform);

  /**
   * Gets the line guide stops for snapping, including stage borders and centers, and edges/centers of other objects.
   * @param skipShape - The shape to skip when calculating guides (the currently dragged shape).
   * @returns Object with vertical and horizontal guide positions.
   */
  const getLineGuideStops = useCallback((skipShape: Konva.Shape) => {
    const stage = skipShape.getStage();
    if (!stage) return { vertical: [], horizontal: [] };

    // we can snap to stage borders and the center of the stage
    const vertical = [0, stage.width() / 2, stage.width()];
    const horizontal = [0, stage.height() / 2, stage.height()];

    // and we snap over edges and center of each object on the canvas
    stage.find('.object').forEach((guideItem) => {
      if (guideItem === skipShape) {
        return;
      }
      const box = guideItem.getClientRect();
      // and we can snap to all edges of shapes
      vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
      horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
    });
    return {
      vertical,
      horizontal,
    };
  }, []);

  /**
   * Gets the snapping edges for a given node (shape).
   * @param node - The Konva shape node.
   * @returns Snapping edges with guide positions, offsets, and snap types.
   */
  const getObjectSnappingEdges = useCallback(
    (node: Konva.Shape): SnappingEdges => {
      const box = node.getClientRect();
      const absPos = node.absolutePosition();

      return {
        vertical: [
          {
            guide: Math.round(box.x),
            offset: Math.round(absPos.x - box.x),
            snap: 'start',
          },
          {
            guide: Math.round(box.x + box.width / 2),
            offset: Math.round(absPos.x - box.x - box.width / 2),
            snap: 'center',
          },
          {
            guide: Math.round(box.x + box.width),
            offset: Math.round(absPos.x - box.x - box.width),
            snap: 'end',
          },
        ],
        horizontal: [
          {
            guide: Math.round(box.y),
            offset: Math.round(absPos.y - box.y),
            snap: 'start',
          },
          {
            guide: Math.round(box.y + box.height / 2),
            offset: Math.round(absPos.y - box.y - box.height / 2),
            snap: 'center',
          },
          {
            guide: Math.round(box.y + box.height),
            offset: Math.round(absPos.y - box.y - box.height),
            snap: 'end',
          },
        ],
      };
    },
    []
  );

  /**
   * Calculates the guides (snapping lines) based on line guide stops and object bounds.
   * @param lineGuideStops - The guide stops from getLineGuideStops.
   * @param itemBounds - The snapping edges from getObjectSnappingEdges.
   * @returns Array of guide objects with line positions, offsets, orientations, and snap types.
   */
  const getGuides = useCallback(
    (
      lineGuideStops: ReturnType<typeof getLineGuideStops>,
      itemBounds: ReturnType<typeof getObjectSnappingEdges>
    ) => {
      const resultV: Array<{
        lineGuide: number;
        diff: number;
        snap: Snap;
        offset: number;
      }> = [];

      const resultH: Array<{
        lineGuide: number;
        diff: number;
        snap: Snap;
        offset: number;
      }> = [];

      lineGuideStops.vertical.forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound) => {
          const diff = Math.abs(lineGuide - itemBound.guide);
          if (diff < GUIDELINE_OFFSET) {
            resultV.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });

      lineGuideStops.horizontal.forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound) => {
          const diff = Math.abs(lineGuide - itemBound.guide);
          if (diff < GUIDELINE_OFFSET) {
            resultH.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });

      const guides: Array<{
        lineGuide: number;
        offset: number;
        orientation: 'V' | 'H';
        snap: 'start' | 'center' | 'end';
      }> = [];

      const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
      const minH = resultH.sort((a, b) => a.diff - b.diff)[0];

      if (minV) {
        guides.push({
          lineGuide: minV.lineGuide,
          offset: minV.offset,
          orientation: 'V',
          snap: minV.snap,
        });
      }

      if (minH) {
        guides.push({
          lineGuide: minH.lineGuide,
          offset: minH.offset,
          orientation: 'H',
          snap: minH.snap,
        });
      }

      return guides;
    },
    []
  );

  /**
   * Draws the snapping guide lines on the given layer.
   * @param guides - The guides to draw.
   * @param layer - The Konva layer to draw on.
   */
  const drawGuides = useCallback(
    (guides: ReturnType<typeof getGuides>, layer: Konva.Layer) => {
      guides.forEach((lg) => {
        if (lg.orientation === 'H') {
          const line = new Konva.Line({
            points: [-6000, 0, 6000, 0],
            stroke: 'rgb(0, 161, 255)',
            strokeWidth: 1,
            name: 'guid-line',
            dash: [4, 6],
          });
          layer.add(line);
          line.absolutePosition({
            x: 0,
            y: lg.lineGuide,
          });
        } else if (lg.orientation === 'V') {
          const line = new Konva.Line({
            points: [0, -6000, 0, 6000],
            stroke: 'rgb(0, 161, 255)',
            strokeWidth: 1,
            name: 'guid-line',
            dash: [4, 6],
          });
          layer.add(line);
          line.absolutePosition({
            x: lg.lineGuide,
            y: 0,
          });
        }
      });
    },
    []
  );

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
      if (node.name && node.name().includes('selectable')) return node;
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

  /**
   * Handles drag move events with optional snapping.
   */
  const handleDragMove: KonvaNodeEvents['onDragMove'] = (e) => {
    if (!snapEnabled) return;

    const layer = e.target.getLayer();
    if (!layer) return;

    // clear all previous lines on the screen
    layer.find('.guid-line').forEach((l) => l.destroy());

    // find possible snapping lines
    const lineGuideStops = getLineGuideStops(e.target as Konva.Shape);
    // find snapping points of current object
    const itemBounds = getObjectSnappingEdges(e.target as Konva.Shape);

    // now find where can we snap current object
    const guides = getGuides(lineGuideStops, itemBounds);

    // do nothing if no snapping
    if (!guides.length) {
      return;
    }

    drawGuides(guides, layer);

    const absPos = e.target.absolutePosition();
    // now force object position
    guides.forEach((lg) => {
      switch (lg.snap) {
        case 'start': {
          switch (lg.orientation) {
            case 'V': {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case 'H': {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
          }
          break;
        }
        case 'center': {
          switch (lg.orientation) {
            case 'V': {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case 'H': {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
          }
          break;
        }
        case 'end': {
          switch (lg.orientation) {
            case 'V': {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case 'H': {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
          }
          break;
        }
      }
    });
    e.target.absolutePosition(absPos);
  };

  /**
   * Handles drag end events, clearing guides and updating transform.
   */
  const handleDragEnd: KonvaNodeEvents['onDragEnd'] = (e) => {
    const layer = e.target.getLayer();
    if (layer) {
      // clear all previous lines on the screen
      layer.find('.guid-line').forEach((l) => l.destroy());
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

  return (
    <div className="bg-background outline outline-border relative">
      <GridPattern width={15} height={15} />

      <Stage
        width={computePaddingAndScale(stageW, stageScale)}
        height={computePaddingAndScale(stageH, stageScale)}
        scaleX={stageScale}
        scaleY={stageScale}
        ref={stageRef}
        key={`${stageW}x${stageH}`}
        className="resize"
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* Dynamically rendered widgets (nodes) */}
          {widgets.map((w) => {
            return (
              <Group
                name="selectable object"
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
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
              >
                {w.type === 'image' && <ImageWithFilters image={w} />}
                {w.type === 'text' && (
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
                )}
              </Group>
            );
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
