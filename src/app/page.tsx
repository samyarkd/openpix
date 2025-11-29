'use client';
import Konva from 'konva';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef } from 'react';

import { useShallow } from 'zustand/shallow';
import CanvasGround from '~/components/canvas-ground';
import { DoSomethingHint } from '~/components/do-something-hint';
import { useSidebar } from '~/components/ui/sidebar';
import { useActiveTab } from '~/hooks/use-active-tab';
import { useEditorStore } from '~/store/editor.store';

const ExportOptions = dynamic(() => import('~/components/export-options'), {
  ssr: false,
});

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const { open } = useSidebar();

  const { activeTab } = useActiveTab();
  const { setContainer, addImageWidget } = useEditorStore(
    useShallow((state) => ({
      setContainer: state.setContainer,
      addImageWidget: state.addImageWidget,
    }))
  );

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current?.clientWidth || 0;
    const h = containerRef.current?.clientHeight || 0;

    setContainer({ width: w, height: h });
  }, [setContainer]);

  useEffect(() => {
    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(containerRef.current);
    }

    return () => {
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

  // Drag and drop for images
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            addImageWidget(url);
          }
        });
      }
    },
    [addImageWidget]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [handleDragOver, handleDrop]);

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
      id="canvas-container-page"
      data-sidebar-open={open}
      className={
        'isolate flex items-center justify-center w-full h-full relative'
      }
      ref={containerRef}
    >
      {/* Do something hint */}
      <DoSomethingHint />

      {/* Image */}
      <CanvasGround stageRef={stageRef} />

      {/* Export Options (portal) */}
      <ExportOptions stageRef={stageRef} />
    </div>
  );
}
