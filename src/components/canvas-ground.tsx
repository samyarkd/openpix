'use client';

import Konva from 'konva';
import { useEffect, useMemo, useRef } from 'react';

import { Image, Layer, Stage } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import type { FiltersState } from '~/components/filters-context';
import { useEditorStore } from '~/store/editor.store';
import StageCropFrame from './editor-tabs/crop/stage-crop-frame';

type CanvasProps = {
  image: HTMLImageElement;
  stageRef: React.RefObject<Konva.Stage | null>;
  filtersState: FiltersState;
  preview: boolean;
};

function CanvasGround({ stageRef, filtersState, preview }: CanvasProps) {
  const imageRef = useRef<Konva.Image>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const isCachedRef = useRef(false);
  const cacheRatioRef = useRef(1);

  const { crop, images, drawH, drawW, offsetX, offsetY, stageH, stageW } =
    useEditorStore(
      useShallow((state) => ({
        drawW: state.drawW,
        drawH: state.drawH,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
        stageW: state.stageW,
        stageH: state.stageH,
        crop: state.crop,
        // image
        images: state.images,
      }))
    );

  const activeFilters = useMemo(() => {
    const list = [];
    if (filtersState.blurRadius > 0) list.push(Konva.Filters.Blur);
    if (filtersState.brightness !== 0) list.push(Konva.Filters.Brighten);
    if (filtersState.contrast !== 0) list.push(Konva.Filters.Contrast);
    if (filtersState.enhance > 0) list.push(Konva.Filters.Enhance);
    if (filtersState.noise > 0) list.push(Konva.Filters.Noise);
    if (filtersState.pixelSize >= 1) list.push(Konva.Filters.Pixelate);
    if (filtersState.threshold > 0) list.push(Konva.Filters.Threshold);
    if (filtersState.levels > 0) list.push(Konva.Filters.Posterize);
    if (
      filtersState.red !== 0 ||
      filtersState.green !== 0 ||
      filtersState.blue !== 0
    )
      list.push(Konva.Filters.RGB);
    // Avoid applying both HSL and HSV at the same time.
    // Prefer HSV when 'value' is active; otherwise prefer HSL when 'luminance' is active;
    // if only hue/saturation changed, default to HSL.
    const hasHueSat = filtersState.hue !== 0 || filtersState.saturation !== 0;
    const useHSV = filtersState.value !== 0;
    const useHSL = !useHSV && (filtersState.luminance !== 0 || hasHueSat);
    if (useHSL) list.push(Konva.Filters.HSL);
    else if (useHSV) list.push(Konva.Filters.HSV);
    return list;
  }, [filtersState]);

  const hasFilters = activeFilters.length > 0;

  // Choose a lower cache pixel ratio during scrubbing,
  // scaled by current draw area to keep FPS high on large images.
  const previewRatio = useMemo(() => {
    if (!preview) return 1;
    const area = Math.max(1, drawW * drawH);
    if (area > 2_000_000) return 0.35; // very large
    if (area > 1_000_000) return 0.5; // large
    return 0.7; // medium/small
  }, [preview, drawW, drawH]);

  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;
    const desiredRatio = hasFilters ? previewRatio : 1;
    if (hasFilters) {
      if (!isCachedRef.current || cacheRatioRef.current !== desiredRatio) {
        node.cache({ pixelRatio: desiredRatio });
        cacheRatioRef.current = desiredRatio;
        isCachedRef.current = true;
      }
    } else {
      if (isCachedRef.current) {
        node.clearCache();
        isCachedRef.current = false;
        cacheRatioRef.current = 1;
      }
    }
    node.getLayer()?.batchDraw();
  }, [hasFilters, previewRatio]);

  // When crop changes, update transformer
  useEffect(() => {
    if (rectRef.current && trRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [crop]);

  // When geometry changes, ensure Stage and cached image refresh correctly
  useEffect(() => {
    const stage = stageRef.current as Konva.Stage | null;
    if (stage) {
      // Imperatively sync size to avoid stale canvas dims
      if (typeof stageW === 'number') stage.width(stageW);
      if (typeof stageH === 'number') stage.height(stageH);
      stage.batchDraw();
    }

    const node = imageRef.current;
    if (node && isCachedRef.current) {
      // Rebuild cache at new size/position so filters render crisp
      node.cache({ pixelRatio: cacheRatioRef.current });
      node.getLayer()?.batchDraw();
    }
  }, [stageW, stageH, drawW, drawH, offsetX, offsetY, stageRef]);

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: crop?.width ?? stageW,
          height: crop?.height ?? stageH,
        }}
      >
        <Stage
          width={crop?.width ?? stageW}
          height={crop?.height ?? stageH}
          ref={stageRef}
          key={`${stageW}x${stageH}`}
        >
          <Layer listening={false}>
            {images.map((image, idx) => (
              <Image
                key={`img-${idx}`}
                ref={imageRef}
                image={image}
                width={drawW}
                height={drawH}
                x={-(crop?.x ?? 0)}
                y={-(crop?.y ?? 0)}
                listening={false}
                perfectDrawEnabled={false}
                shadowForStrokeEnabled={false}
                transformsEnabled="position"
                // Filters
                filters={activeFilters}
                // Blur
                blurRadius={filtersState.blurRadius}
                // Brightness / Contrast / Enhance
                brightness={filtersState.brightness}
                contrast={filtersState.contrast}
                enhance={filtersState.enhance}
                // Noise / Pixelate / Threshold / Posterize
                noise={filtersState.noise}
                pixelSize={Math.max(0, Math.floor(filtersState.pixelSize))}
                threshold={filtersState.threshold}
                levels={filtersState.levels}
                // RGBA
                red={filtersState.red}
                green={filtersState.green}
                blue={filtersState.blue}
                // alpha={filtersState.alpha}
                // HSL / HSV
                hue={filtersState.hue}
                saturation={filtersState.saturation}
                luminance={filtersState.luminance}
                value={filtersState.value}
              />
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
