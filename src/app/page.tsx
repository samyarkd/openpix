'use client';
import { useEffect, useRef, useState } from 'react';
import { Image, Layer, Stage } from 'react-konva';
import { useImage } from '~/hooks/use-image';

export default function Home() {
  const [image] = useImage('./favicon.ico', {
    crossOrigin: 'anonymous',
  });
  const ref = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState({ width: 0, height: 0 });

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

  const imgW = image?.width || 0;
  const imgH = image?.height || 0;
  const stageW = container.width - 10;
  const stageH = container.height - 10;
  const scale =
    imgW && imgH && stageW && stageH
      ? Math.min(stageW / imgW, stageH / imgH)
      : 1;
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const offsetX = (stageW - drawW) / 2;
  const offsetY = (stageH - drawH) / 2;

  return (
    <div className="h-full w-full overflow-hidden" ref={ref}>
      {/* canvas */}
      <Stage width={stageW} height={stageH}>
        <Layer>
          {image && (
            <Image
              image={image}
              width={drawW}
              height={drawH}
              x={offsetX}
              y={offsetY}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
