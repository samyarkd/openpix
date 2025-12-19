'use client';

import Konva from 'konva';
import { useEffect, useRef } from 'react';

import { Group, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useDragTransform } from '~/hooks/use-drag-transform';
import { useSelection } from '~/hooks/use-selection';
import { useSnapping } from '~/hooks/use-snapping';
import { useEditorStore } from '~/store/editor.store';
import { computePaddingAndScale } from '~/store/utils/geometry';
import StageCropFrame from './editor-tabs/crop/stage-crop-frame';
import ImageWithFilters from './image-with-filters';
import { GridPattern } from './magicui/grid-pattern';

type CanvasProps = {
  stageRef: React.RefObject<Konva.Stage | null>;
};

function CanvasGround({ stageRef }: CanvasProps) {
  const {
    backgroundColor,
    stageH,
    stageW,
    stageScale,
    widgets,
    setSelectedWidgetIds,
    selectedWidgetIds,
    activeTab,
    snapEnabled,
    updateWidgetTransform,
    removeWidgets,
  } = useEditorStore(
    useShallow((state) => ({
      backgroundColor: state.backgroundColor,
      activeTab: state.activeTab,
      stageW: state.stageW,
      stageH: state.stageH,
      stageScale: state.stageScale,
      // image
      widgets: state.widgets,

      // selectedWIdgets
      snapEnabled: state.snapEnabled,
      selectedWidgetIds: state.selectedWidgetIds,
      setSelectedWidgetIds: state.setSelectedWidgetIds,
      updateWidgetTransform: state.updateWidgetTransform,
      removeWidgets: state.removeWidgets,
    }))
  );

  const stageWrapperRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const groupRefs = useRef<Map<string, Konva.Group | Konva.Node>>(new Map());

  const { handleDragMove } = useSnapping(snapEnabled);

  const {
    selectionRect,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleStageClick,
  } = useSelection(groupRefs, selectedWidgetIds, setSelectedWidgetIds);

  const { handleDragEnd, handleTransformEnd } = useDragTransform(
    updateWidgetTransform
  );

  // Click outside of canvas container to clear selection
  const onContainerClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (
      !stageWrapperRef.current?.contains(e.target as Node) &&
      e.target instanceof HTMLElement
    ) {
      setSelectedWidgetIds([]);
    }
  };

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

  // Handle delete key for selected widgets
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

  return (
    <div className="absolute inset-0 grid" onClick={onContainerClick}>
      <div
        ref={stageWrapperRef}
        className="bg-background outline outline-border relative grid m-auto [&_#konvajs-content]:m-auto"
      >
        <GridPattern width={15} height={15} />

        <Stage
          width={computePaddingAndScale(stageW, stageScale)}
          height={computePaddingAndScale(stageH, stageScale)}
          scaleX={stageScale}
          scaleY={stageScale}
          ref={stageRef}
          key={`${stageW}x${stageH}`}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {/* Background Color */}
          {backgroundColor && (
            <Layer>
              <Rect
                width={computePaddingAndScale(stageW, stageScale) * 1.3}
                height={computePaddingAndScale(stageH, stageScale) * 1.3}
                fill={backgroundColor}
                listening={false}
              />
            </Layer>
          )}

          {/* Dynamically rendered widgets (nodes) */}
          <Layer>
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

          {/* Shape Transformer rectangle */}
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
    </div>
  );
}

export default CanvasGround;
