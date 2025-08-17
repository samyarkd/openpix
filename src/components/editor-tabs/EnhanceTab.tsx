'use client';

import { useFilters } from '~/components/filters-context';
import { EditorSlider } from './editor-slider';

export default function EnhanceTab() {
  const { filters, setFilters } = useFilters();
  return (
    <div className="p-3 flex flex-col gap-6">
      {/* Enhance */}
      <EditorSlider
        id="enhance"
        label={`Enhance (${filters.enhance.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={[filters.enhance]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, enhance: v }))}
      />

      {/* Brightness */}
      <EditorSlider
        id="brightness"
        label={`Brightness (${filters.brightness.toFixed(2)})`}
        min={-1}
        max={1}
        step={0.01}
        value={[filters.brightness]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, brightness: v }))}
      />

      {/* Contrast */}
      <EditorSlider
        id="contrast"
        label={`Contrast (${filters.contrast.toFixed(0)})`}
        min={-100}
        max={100}
        step={1}
        value={[filters.contrast]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, contrast: v }))}
      />

      {/* Blur */}
      <EditorSlider
        id="blur"
        label={`Blur (${filters.blurRadius.toFixed(0)})`}
        min={0}
        max={50}
        step={1}
        value={[filters.blurRadius]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, blurRadius: v }))}
      />

      {/* Noise */}
      <EditorSlider
        id="noise"
        label={`Noise (${filters.noise.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={[filters.noise]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, noise: v }))}
      />

      {/* Pixelate */}
      <EditorSlider
        id="pixelate"
        label={`Pixel size (${filters.pixelSize.toFixed(0)})`}
        min={0}
        max={50}
        step={1}
        value={[filters.pixelSize]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, pixelSize: v }))}
      />

      {/* Threshold */}
      <EditorSlider
        id="threshold"
        label={`Threshold (${filters.threshold.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={[filters.threshold]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, threshold: v }))}
      />

      {/* Posterize levels */}
      <EditorSlider
        id="levels"
        label={`Posterize (${filters.levels.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={[filters.levels]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, levels: v }))}
      />

      {/* RGBA */}
      <EditorSlider
        id="red"
        label={`Red (+${filters.red.toFixed(0)})`}
        min={0}
        max={255}
        step={1}
        value={[filters.red]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, red: v }))}
      />
      <EditorSlider
        id="green"
        label={`Green (+${filters.green.toFixed(0)})`}
        min={0}
        max={255}
        step={1}
        value={[filters.green]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, green: v }))}
      />
      <EditorSlider
        id="blue"
        label={`Blue (+${filters.blue.toFixed(0)})`}
        min={0}
        max={255}
        step={1}
        value={[filters.blue]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, blue: v }))}
      />
      <EditorSlider
        id="alpha"
        label={`Alpha (${filters.alpha.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={[filters.alpha]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, alpha: v }))}
      />

      {/* HSL */}
      <EditorSlider
        id="hue"
        label={`Hue (${filters.hue.toFixed(0)})`}
        min={-180}
        max={180}
        step={1}
        value={[filters.hue]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, hue: v }))}
      />
      <EditorSlider
        id="saturation"
        label={`Saturation (${filters.saturation.toFixed(2)})`}
        min={-2}
        max={2}
        step={0.01}
        value={[filters.saturation]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, saturation: v }))}
      />
      <EditorSlider
        id="luminance"
        label={`Luminance (${filters.luminance.toFixed(2)})`}
        min={-1}
        max={1}
        step={0.01}
        value={[filters.luminance]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, luminance: v }))}
      />

      {/* HSV Value */}
      <EditorSlider
        id="value"
        label={`HSV Value (${filters.value.toFixed(0)})`}
        min={0}
        max={10}
        step={0.2}
        value={[filters.value]}
        onValueChange={([v]) => setFilters((s) => ({ ...s, value: v }))}
      />
    </div>
  );
}
