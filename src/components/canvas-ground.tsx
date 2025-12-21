'use client';

import { useRef } from 'react'
import { Stage } from 'react-konva'
import { useShallow } from 'zustand/shallow'

import { useDeleteKey } from '~/hooks/use-delete-key'
import { useOutsideSelectionClick } from '~/hooks/use-outside-selection-click'
import { useSelection } from '~/hooks/use-selection'
import { useStageSync } from '~/hooks/use-stage-sync'
import { useTransformerSync } from '~/hooks/use-transformer-sync'
import { useEditorStore } from '~/store/editor.store'
import { computePaddingAndScale } from '~/store/utils/geometry'
import BackgroundColor from './canvas/background-color'
import SelectionRectangle from './canvas/selection-rectangle'
import ShapeTransformer from './canvas/shape-transformer'
import WidgetsRenderer from './canvas/widgets-renderer'
import StageCropFrame from './editor-tabs/crop/stage-crop-frame'
import { GridPattern } from './magicui/grid-pattern'

function CanvasGround() {
  const {
    setStageRefs,
    stageH,
    stageW,
    stageScale,
    setSelectedWidgetIds,
  } = useEditorStore(
    useShallow((state) => ({
      setStageRefs: state.setStageRefs,
      stageW: state.stageW,
      stageH: state.stageH,
      stageScale: state.stageScale,
      setSelectedWidgetIds: state.setSelectedWidgetIds,
    }))
  );

  const stageWrapperRef = useRef<HTMLDivElement>(null);

  const {
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleStageClick,
  } = useSelection();

  // Custom hooks to handle side effects
  useStageSync();
  useDeleteKey();
  useTransformerSync();
  useOutsideSelectionClick(() => setSelectedWidgetIds([]));

  // Click outside of canvas container to clear selection
  const onContainerClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (
      !stageWrapperRef.current?.contains(e.target as Node) &&
      e.target instanceof HTMLElement
    ) {
      setSelectedWidgetIds([]);
    }
  };

  return (
    <div className="absolute inset-0 grid" onClick={onContainerClick}>
      <div
        ref={stageWrapperRef}
        className="bg-background outline outline-border relative grid m-auto [&_#konvajs-content]:m-auto"
      >
        <GridPattern width={15} height={15} />

        <Stage
          ref={setStageRefs('stageRef')}
          width={computePaddingAndScale(stageW, stageScale)}
          height={computePaddingAndScale(stageH, stageScale)}
          scaleX={stageScale}
          scaleY={stageScale}
          key={`${stageW}x${stageH}`}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {/* Background Color */}
          <BackgroundColor />

          {/* Dynamically rendered widgets (nodes) */}
          <WidgetsRenderer />

          {/* Shape Transformer rectangle */}
          <ShapeTransformer />

          {/* Selection rectangle */}
          <SelectionRectangle />
        </Stage>

        {/* Canvas Resize/Crop frame */}
        <StageCropFrame />
      </div>
    </div>
  );
}

export default CanvasGround;
