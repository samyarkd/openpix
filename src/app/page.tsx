'use client';
import Konva from 'konva';
import { DownloadIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const w = ref.current.clientWidth || 0;
      const h = ref.current.clientHeight || 0;
      setContainer((prev) =>
        prev.width !== w || prev.height !== h ? { width: w, height: h } : prev
      );
    };
    update();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && ref.current) {
      ro = new ResizeObserver(update);
      ro.observe(ref.current);
    }

    // Debounced resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(update, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      ro?.disconnect();
    };
  }, []);

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
  const stageH = Math.max(0, Math.round(container.height - 1));
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
          filtersState={filters}
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
}: CanvasProps) {
  const imageRef = useRef<Konva.Image>(null);

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
    if (
      filtersState.hue !== 0 ||
      filtersState.saturation !== 0 ||
      filtersState.luminance !== 0
    )
      list.push(Konva.Filters.HSL);
    if (
      filtersState.hue !== 0 ||
      filtersState.saturation !== 0 ||
      filtersState.value !== 0
    )
      list.push(Konva.Filters.HSV);
    return list;
  }, [filtersState]);

  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;
    if (activeFilters.length > 0) {
      // cache to enable filters
      node.cache();
      node.getLayer()?.batchDraw();
    } else {
      node.clearCache();
      node.getLayer()?.batchDraw();
    }
  }, [activeFilters]);

  const konvaImage = (
    <Image
      ref={imageRef}
      image={image}
      width={drawW}
      height={drawH}
      x={offsetX}
      y={offsetY}
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
    <Stage width={stageW} height={stageH} ref={stageRef}>
      <Layer>{konvaImage}</Layer>
    </Stage>
  );
}
