'use client';

import Konva from 'konva';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useEditorTab } from '~/components/editor-tab-context';

import { useShallow } from 'zustand/shallow';
import CanvasGround from '~/components/canvas-ground';
import ExportOptions from '~/components/export-options';
import { useFilters } from '~/components/filters-context';
import ImageDropZone from '~/components/image-input';
import { GridPattern } from '~/components/magicui/grid-pattern';
import { useSidebar } from '~/components/ui/sidebar';
import { useEditorStore } from '~/store/editor.store';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const { open } = useSidebar();
  const { filters } = useFilters();

  const { image, stageW, setCanvasDate, addImage } = useEditorStore(
    useShallow((state) => ({
      stageW: state.stageW,
      image: state.image,
      //
      setCanvasDate: state.setCanvasDate,
      addImage: state.addImage,
    }))
  );

  // Defer filter updates so slider UI stays responsive while image updates later
  const deferredFilters = useDeferredValue(filters);

  const { activeTab } = useEditorTab();

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

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth || 0;
    const h = containerRef.current.clientWidth || 0;

    setContainer((prev) =>
      prev.width !== w || prev.height !== h ? { width: w, height: h } : prev
    );
  }, []);

  useEffect(() => {
    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(containerRef.current);
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
    const gap = document.querySelector<HTMLElement>(
      '[data-slot="sidebar-gap"]'
    );
    if (!gap) return;
    const onEnd = () => measure();
    gap.addEventListener('transitionend', onEnd);
    return () => gap.removeEventListener('transitionend', onEnd);
  }, [measure]);

  // Observe sidebar gap size changes to react during the animation
  useEffect(() => {
    const gap = document.querySelector<HTMLElement>(
      '[data-slot="sidebar-gap"]'
    );
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

  useEffect(() => {
    const imgW = image?.width || 0;
    const imgH = image?.height || 0;

    // Shrink drawing area when cropping to allow 20px padding each side
    const cropPad = activeTab === 'crop' ? 24 : 0;

    // Snap to whole pixels to avoid subpixel blur
    const containerW = container.width;
    const containerH = container.height;

    const scaleW = containerW / imgW;
    const scaleH = containerH / imgH;
    const scale =
      imgW && imgH && containerW && containerH ? Math.min(scaleW, scaleH) : 1;

    const stageW = imgW * scale - cropPad * scaleH;
    const stageH = imgH * scale - cropPad * scaleW;

    const drawW = stageW;
    const drawH = stageH;

    const offsetX = (stageW - drawW) / 2;
    const offsetY = (stageH - drawH) / 2;

    setCanvasDate({
      drawH,
      drawW,
      imgH,
      imgW,
      offsetX,
      offsetY,
      stageH,
      stageW,
    });
  }, [
    activeTab,
    image,
    // sizes
    image?.width,
    image?.height,
    container.height,
    container.width,
  ]);

  return (
    <div
      data-sidebar-open={open}
      className={'absolute inset-0 isolate flex items-center justify-center'}
      ref={containerRef}
    >
      {/* canvas */}
      <GridPattern className="z-0" />

      {/* Image */}
      {image && stageW && (
        <CanvasGround
          image={image}
          stageRef={stageRef}
          filtersState={deferredFilters}
          preview={isScrubbing}
        />
      )}

      {/* Drop zone */}
      {!image && <ImageDropZone onSelect={addImage} />}

      {/* Export Options */}
      <ExportOptions stageRef={stageRef} />
    </div>
  );
}
