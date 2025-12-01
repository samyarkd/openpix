import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { Widget } from '~/store/editor.types';

interface WidgetPreviewProps {
  widget: Widget;
}

const WidgetPreview = ({ widget }: WidgetPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a small stage for preview
    const stage = new Konva.Stage({
      container: containerRef.current,
      width: 60,
      height: 40,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Scale factor to fit widget in preview
    const scale = Math.min(60 / 100, 40 / 100); // Assuming original size is around 100x100

    if (widget.type === 'text') {
      const text = new Konva.Text({
        text:
          widget.text.length > 10
            ? widget.text.substring(0, 10) + '...'
            : widget.text,
        fontSize: Math.max(8, widget.fontSize * scale * 0.5),
        fill: widget.fill,
        align: widget.align,
        fontStyle: widget.fontStyle,
        fontFamily: widget.fontFamily,
        x: 2,
        y: 2,
        width: 56,
        height: 36,
      });
      layer.add(text);
    } else if (widget.type === 'image' && widget.img) {
      const img = new Konva.Image({
        image: widget.img,
        width: Math.min(56, widget.drawW * scale),
        height: Math.min(36, widget.drawH * scale),
        x: 2,
        y: 2,
      });
      layer.add(img);
    } else if (widget.type === 'sticker') {
      // Placeholder for sticker
      const rect = new Konva.Rect({
        width: 56,
        height: 36,
        fill: '#f0f0f0',
        stroke: '#ccc',
        strokeWidth: 1,
        x: 2,
        y: 2,
      });
      const text = new Konva.Text({
        text: 'Sticker',
        fontSize: 10,
        fill: '#666',
        x: 2,
        y: 15,
        width: 56,
        align: 'center',
      });
      layer.add(rect);
      layer.add(text);
    }

    stage.draw();
    stageRef.current = stage;

    return () => {
      stage.destroy();
    };
  }, [widget]);

  return (
    <div
      ref={containerRef}
      className="w-15 h-10 border border-border rounded bg-white overflow-hidden"
      style={{ width: '60px', height: '40px' }}
    />
  );
};

export default WidgetPreview;
