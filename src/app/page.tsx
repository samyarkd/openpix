'use client';

import Konva from 'konva';
import { useCallback, useEffect, useRef } from 'react';

import { useShallow } from 'zustand/shallow';
import CanvasGround from '~/components/canvas-ground';
import ExportOptions from '~/components/export-options';
import ImageDropZone from '~/components/image-input';
import { GridPattern } from '~/components/magicui/grid-pattern';
import { useSidebar } from '~/components/ui/sidebar';
import { useActiveTab } from '~/hooks/use-active-tab';
import { useEditorStore } from '~/store/editor.store';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const { open } = useSidebar();

  const { activeTab } = useActiveTab();
  const { image, stageW, addImage, setContainer } = useEditorStore(
    useShallow((state) => ({
      stageW: state.stageW,
      image: state.rootImage,
      container: state.container,
      //
      addImage: state.addImage,
      setContainer: state.setContainer,
    }))
  );

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current?.clientWidth || 0;
    const h = containerRef.current?.clientHeight || 0;
    setContainer({ width: w, height: h });
  }, [
    containerRef.current?.clientWidth,
    containerRef.current?.clientHeight,
    activeTab,
  ]);

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
  }, [open, activeTab, measure]);

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

  return (
    <div
      data-sidebar-open={open}
      className={'absolute inset-0 isolate flex items-center justify-center'}
      ref={containerRef}
    >
      {/* canvas */}
      <GridPattern className="z-0" />

      {/* Image */}
      {image && stageW && <CanvasGround stageRef={stageRef} />}

      {/* Drop zone */}
      {!image && <ImageDropZone onSelect={addImage} />}

      {/* Export Options */}
      <ExportOptions stageRef={stageRef} />
    </div>
  );
}
