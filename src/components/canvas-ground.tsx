'use client';

import Konva from 'konva';
import { useEffect, useRef } from 'react';

import { Layer, Stage } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import StageCropFrame from './editor-tabs/crop/stage-crop-frame';
import ImageWithFilters from './image-with-filters';

type CanvasProps = {
  stageRef: React.RefObject<Konva.Stage | null>;
};

function CanvasGround({ stageRef }: CanvasProps) {
  const rectRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const { frameCrop, images, stageH, stageW } = useEditorStore(
    useShallow((state) => ({
      stageW: state.stageW,
      stageH: state.stageH,
      frameCrop: state.frameCrop,
      // image
      images: state.images,
    }))
  );

  // When crop changes, update transformer
  useEffect(() => {
    if (rectRef.current && trRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [frameCrop]);

  // When geometry changes, ensure Stage and cached image refresh correctly
  useEffect(() => {
    const stage = stageRef.current as Konva.Stage | null;
    if (stage) {
      // Imperatively sync size to avoid stale canvas dims
      if (typeof stageW === 'number') stage.width(stageW);
      if (typeof stageH === 'number') stage.height(stageH);
      stage.batchDraw();
    }
  }, [stageW, stageH, stageRef]);

  return (
    <>
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
        >
          <Layer>
            {images.map((image) => (
              <ImageWithFilters image={image} key={image.id} />
            ))}
          </Layer>
        </Stage>

        {/* Canvas Resize/Crop frame */}
        <StageCropFrame />
      </div>
    </>
  );
}

export default CanvasGround;
