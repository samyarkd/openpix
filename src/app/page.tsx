'use client';
import Konva from 'konva';
import { DownloadIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Layer, Stage } from 'react-konva';
import type { FiltersState } from '~/components/filters-context';
import { useFilters } from '~/components/filters-context';
import ImageDropZone from '~/components/image-input';
import { GridPattern } from '~/components/magicui/grid-pattern';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import { useImage } from '~/hooks/use-image';
import { downloadStage } from '~/lib/export-image';

export default function Home() {
  const [imageUrl, setImageUrl] = useState('');
  const [image] = useImage(imageUrl, {
    crossOrigin: 'anonymous',
  });
  const ref = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const { open } = useSidebar();
  const { filters } = useFilters();
  // Defer filter updates so slider UI stays responsive while image updates later
  const deferredFilters = useDeferredValue(filters);

  // Detect scrubbing (frequent filter changes) to lower preview quality
  const [isScrubbing, setIsScrubbing] = useState(false);
  useEffect(() => {
    let tid: NodeJS.Timeout | null = null;
    setIsScrubbing(true);
    tid && clearTimeout(tid);
    tid = setTimeout(() => setIsScrubbing(false), 150);
    return () => {
      if (tid) clearTimeout(tid);
    };
  }, [filters]);

  // Export options
  const [exportMime, setExportMime] = useState<
    'image/png' | 'image/jpeg' | 'image/webp'
  >('image/png');
  const [exportScale, setExportScale] = useState<'1' | '2' | '3' | 'dpr'>(
    'dpr'
  );

  // Revoke old object URLs to avoid leaks
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const measure = useCallback(() => {
    if (!ref.current) return;
    const w = ref.current.clientWidth || 0;
    const h = ref.current.clientHeight || 0;
    setContainer((prev) =>
      prev.width !== w || prev.height !== h ? { width: w, height: h } : prev
    );
  }, []);

  useEffect(() => {
    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && ref.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(ref.current);
    }

    // Debounced window resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(measure, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      ro?.disconnect();
    };
  }, [measure]);

  // Ensure we re-measure when the sidebar open state changes
  useEffect(() => {
    // Measure now and after the sidebar transition ends (~200ms)
    measure();
    const id = setTimeout(measure, 250);
    // Also schedule a rAF tick to catch immediate layout
    const raf = requestAnimationFrame(measure);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [open, measure]);

  // Also listen for the actual CSS transition end on the sidebar gap
  useEffect(() => {
    const gap = document.querySelector<HTMLElement>('[data-slot="sidebar-gap"]');
    if (!gap) return;
    const onEnd = () => measure();
    gap.addEventListener('transitionend', onEnd);
    return () => gap.removeEventListener('transitionend', onEnd);
  }, [measure]);

  // Observe sidebar gap size changes to react during the animation
  useEffect(() => {
    const gap = document.querySelector<HTMLElement>('[data-slot="sidebar-gap"]');
    if (!gap || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(gap);
    return () => ro.disconnect();
  }, [measure]);

  // High-DPI: sync Konva pixel ratio with devicePixelRatio
  useEffect(() => {
    const applyDpr = () => {
      if (typeof window === 'undefined') return;
      Konva.pixelRatio = window.devicePixelRatio || 1;
    };
    applyDpr();
    window.addEventListener('resize', applyDpr);
    return () => window.removeEventListener('resize', applyDpr);
  }, []);

  const imgW = image?.width || 0;
  const imgH = image?.height || 0;
  // Snap to whole pixels to avoid subpixel blur
  const stageW = Math.max(0, Math.round(container.width));
  const stageH = Math.max(0, Math.round(container.height));
  const scale =
    imgW && imgH && stageW && stageH
      ? Math.min(stageW / imgW, stageH / imgH)
      : 1;
  const drawW = Math.round(imgW * scale);
  const drawH = Math.round(imgH * scale);
  const offsetX = Math.round((stageW - drawW) / 2);
  const offsetY = Math.round((stageH - drawH) / 2);

  const handleDownload = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      const desiredScale =
        exportScale === 'dpr'
          ? typeof window !== 'undefined'
            ? window.devicePixelRatio || 1
            : 1
          : Number(exportScale);
      const ext = exportMime.split('/')[1];
      const quality = exportMime === 'image/png' ? 1 : 0.92;
      // Crop to image draw rect and adjust pixelRatio so output dimensions match original*desiredScale
      const cropX = Math.max(0, offsetX);
      const cropY = Math.max(0, offsetY);
      const cropW = Math.max(1, drawW);
      const cropH = Math.max(1, drawH);
      const pixelRatio = cropW > 0 ? (imgW * desiredScale) / cropW : 1;

      await downloadStage(stage, `export.${ext}`, {
        mimeType: exportMime,
        pixelRatio,
        quality,
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH,
      });
    } catch {
      // no-op
    }
  }, [exportScale, exportMime, offsetX, offsetY, drawW, drawH, imgW]);

  // Keyboard: Ctrl/Cmd+S to export when an image is loaded
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!image) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownload();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [image, handleDownload]);

  return (
    <div
      data-sidebar-open={open}
      className="absolute inset-0 overflow-hidden isolate"
      ref={ref}
    >
      {/* canvas */}
      <GridPattern className="z-0" />
      {image ? (
        <CanvasWithFilters
          stageW={stageW}
          stageH={stageH}
          drawW={drawW}
          drawH={drawH}
          offsetX={offsetX}
          offsetY={offsetY}
          image={image}
          stageRef={stageRef}
          filtersState={deferredFilters}
          preview={isScrubbing}
        />
      ) : (
        <ImageDropZone onSelect={(url) => setImageUrl(url)} />
      )}
      {image && (
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <DownloadIcon className="mr-2" /> Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" aria-label="Export options">
                <SlidersHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Format</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={exportMime}
                onValueChange={(v) =>
                  setExportMime(v as 'image/png' | 'image/jpeg' | 'image/webp')
                }
              >
                <DropdownMenuRadioItem value="image/png">
                  PNG (.png)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="image/jpeg">
                  JPEG (.jpg)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="image/webp">
                  WebP (.webp)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Scale</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={exportScale}
                onValueChange={(v) =>
                  setExportScale(v as '1' | '2' | '3' | 'dpr')
                }
              >
                <DropdownMenuRadioItem value="1">1x</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="3">3x</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dpr">
                  Match device pixel ratio
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

type CanvasProps = {
  stageW: number;
  stageH: number;
  drawW: number;
  drawH: number;
  offsetX: number;
  offsetY: number;
  image: HTMLImageElement;
  stageRef: React.RefObject<Konva.Stage | null>;
  filtersState: FiltersState;
  preview: boolean;
};

function CanvasWithFilters({
  stageW,
  stageH,
  drawW,
  drawH,
  offsetX,
  offsetY,
  image,
  stageRef,
  filtersState,
  preview,
}: CanvasProps) {
  const imageRef = useRef<Konva.Image>(null);
  const isCachedRef = useRef(false);
  const cacheRatioRef = useRef(1);

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
      filtersState.blue !== 0 ||
      filtersState.alpha !== 1
    )
      list.push(Konva.Filters.RGBA);
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

  const konvaImage = (
    <Image
      ref={imageRef}
      image={image}
      width={drawW}
      height={drawH}
      x={offsetX}
      y={offsetY}
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
      alpha={filtersState.alpha}
      // HSL / HSV
      hue={filtersState.hue}
      saturation={filtersState.saturation}
      luminance={filtersState.luminance}
      value={filtersState.value}
    />
  );

  return (
    <Stage width={stageW} height={stageH} ref={stageRef} key={`${stageW}x${stageH}`}>
      <Layer listening={false}>{konvaImage}</Layer>
    </Stage>
  );
}
