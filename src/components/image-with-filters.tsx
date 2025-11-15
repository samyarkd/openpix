import Konva from 'konva';
import { useDeferredValue, useEffect, useMemo, useRef } from 'react';
import { Image } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { ImageItem, useEditorStore } from '~/store/editor.store';

const ImageWithFilters = (props: { image: ImageItem }) => {
  const image = props.image;

  // Defer filter updates so slider UI stays responsive while image updates later
  const filtersState = useDeferredValue(image.filters);

  const imageRef = useRef<Konva.Image | null>(null);
  const isCachedRef = useRef(false);
  const cacheRatioRef = useRef(1);

  const { stageH, stageW } = useEditorStore(
    useShallow((state) => ({
      stageW: state.stageW,
      stageH: state.stageH,
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

  // Ensure node is cached when filters are active; clear when no filters
  useEffect(() => {
    const node = imageRef.current;
    const htmlImg = image.img;

    if (!node || !htmlImg) return;

    const hasFilters = activeFilters.length > 0;

    if (hasFilters) {
      // pick a reasonable pixelRatio for crisp filters without going too high
      const natW = htmlImg.width || 1;
      const drawW = image.drawW || natW;
      const ratio = Math.min(2, Math.max(1, drawW / natW));
      cacheRatioRef.current = ratio;

      node.cache({ pixelRatio: cacheRatioRef.current });
      isCachedRef.current = true;
      node.getLayer()?.batchDraw();
    } else if (isCachedRef.current) {
      node.clearCache();
      isCachedRef.current = false;
      node.getLayer()?.batchDraw();
    }
  }, [image.img, image.drawW, image.drawH, activeFilters, filtersState]);

  // When geometry changes, cached image refresh correctly
  useEffect(() => {
    const node = imageRef.current;

    if (node && isCachedRef.current) {
      // Rebuild cache at new size/position so filters render crisp
      node.cache({ pixelRatio: cacheRatioRef.current });
      node.getLayer()?.batchDraw();
    }
  }, [stageW, stageH]);

  return (
    <Image
      ref={imageRef}
      image={image.img}
      width={image.drawW}
      height={image.drawH}
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
  );
};

export default ImageWithFilters;
