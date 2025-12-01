'use client';

import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import { FilterSlider } from './filter-slider';
import { RemoveButton } from '../type/remove-button';

export default function EnhanceImage() {
  // Only subscribe to whether an active image exists to show/hide the tab
  const { hasActive, selectedImageId } = useEditorStore(
    useShallow((s) => ({
      selectedImageId: s.selectedWidgetId,
      hasActive: Boolean(
        s.widgets
          .filter((w) => w.type === 'image')
          .find((i) => i.id === s.selectedWidgetId)
      ),
    }))
  );

  if (!hasActive || !selectedImageId) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Brightness */}
      <FilterSlider
        filterKey="brightness"
        id="brightness"
        label={(v) => `Brightness (${v.toFixed(2)})`}
        min={-1}
        max={1}
        step={0.01}
      />

      {/* Contrast */}
      <FilterSlider
        filterKey="contrast"
        id="contrast"
        label={(v) => `Contrast (${v.toFixed(0)})`}
        min={-100}
        max={100}
        step={1}
      />

      {/* Blur */}
      <FilterSlider
        filterKey="blurRadius"
        id="blur"
        label={(v) => `Blur (${v.toFixed(0)})`}
        min={0}
        max={50}
        step={1}
      />

      {/* Noise */}
      <FilterSlider
        filterKey="noise"
        id="noise"
        label={(v) => `Noise (${v.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
      />

      {/* Pixelate */}
      <FilterSlider
        filterKey="pixelSize"
        id="pixelate"
        label={(v) => `Pixel size (${v.toFixed(0)})`}
        min={0}
        max={50}
        step={1}
      />

      {/* Threshold */}
      <FilterSlider
        filterKey="threshold"
        id="threshold"
        label={(v) => `Threshold (${v.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
      />

      {/* RGBA */}
      <FilterSlider
        filterKey="red"
        id="red"
        label={(v) => (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Red (+{v.toFixed(0)})</span>
          </div>
        )}
        min={0}
        max={255}
        step={1}
      />
      <FilterSlider
        filterKey="green"
        id="green"
        label={(v) => (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Green (+{v.toFixed(0)})</span>
          </div>
        )}
        min={0}
        max={255}
        step={1}
      />
      <FilterSlider
        filterKey="blue"
        id="blue"
        label={(v) => (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Blue (+{v.toFixed(0)})</span>
          </div>
        )}
        min={0}
        max={255}
        step={1}
      />

      {/* HSL */}
      <FilterSlider
        filterKey="hue"
        id="hue"
        label={(v) => `Hue (${v.toFixed(0)})`}
        min={-180}
        max={180}
        step={1}
      />
      <FilterSlider
        filterKey="saturation"
        id="saturation"
        label={(v) => `Saturation (${v.toFixed(2)})`}
        min={-2}
        max={2}
        step={0.01}
      />
      <FilterSlider
        filterKey="luminance"
        id="luminance"
        label={(v) => `Luminance (${v.toFixed(2)})`}
        min={-1}
        max={1}
        step={0.01}
      />

      {/* HSV Value */}
      <FilterSlider
        filterKey="value"
        id="value"
        label={(v) => `HSV Value (${v.toFixed(0)})`}
        min={0}
        max={10}
        step={0.2}
      />
      <RemoveButton widgetId={selectedImageId} />
    </div>
  );
}
