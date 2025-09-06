'use client';

import React, { startTransition } from 'react';
import { defaultFilters, useFilters } from '~/components/filters-context';
import { EditorSlider } from './editor-slider';

export default function EnhanceTab() {
  const { filters, setFilters } = useFilters();

  // Stable callbacks per control
  const onEnhance = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, enhance: v }))),
    [setFilters]
  );
  const onBrightness = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, brightness: v }))),
    [setFilters]
  );
  const onContrast = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, contrast: v }))),
    [setFilters]
  );
  const onBlur = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, blurRadius: v }))),
    [setFilters]
  );
  const onNoise = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, noise: v }))),
    [setFilters]
  );
  const onPixelSize = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, pixelSize: v }))),
    [setFilters]
  );
  const onThreshold = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, threshold: v }))),
    [setFilters]
  );
  const onLevels = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, levels: v }))),
    [setFilters]
  );
  const onRed = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, red: v }))),
    [setFilters]
  );
  const onGreen = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, green: v }))),
    [setFilters]
  );
  const onBlue = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, blue: v }))),
    [setFilters]
  );
  const onAlpha = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, alpha: v }))),
    [setFilters]
  );
  const onHue = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, hue: v }))),
    [setFilters]
  );
  const onSaturation = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, saturation: v }))),
    [setFilters]
  );
  const onLuminance = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, luminance: v }))),
    [setFilters]
  );
  const onValue = React.useCallback(
    ([v]: number[]) =>
      startTransition(() => setFilters((s) => ({ ...s, value: v }))),
    [setFilters]
  );

  // Stable value arrays so EditorSlider props remain referentially equal
  const enhanceVal = React.useMemo(() => [filters.enhance], [filters.enhance]);
  const brightnessVal = React.useMemo(
    () => [filters.brightness],
    [filters.brightness]
  );
  const contrastVal = React.useMemo(
    () => [filters.contrast],
    [filters.contrast]
  );
  const blurVal = React.useMemo(
    () => [filters.blurRadius],
    [filters.blurRadius]
  );
  const noiseVal = React.useMemo(() => [filters.noise], [filters.noise]);
  const pixelSizeVal = React.useMemo(
    () => [filters.pixelSize],
    [filters.pixelSize]
  );
  const thresholdVal = React.useMemo(
    () => [filters.threshold],
    [filters.threshold]
  );
  const levelsVal = React.useMemo(() => [filters.levels], [filters.levels]);
  const redVal = React.useMemo(() => [filters.red], [filters.red]);
  const greenVal = React.useMemo(() => [filters.green], [filters.green]);
  const blueVal = React.useMemo(() => [filters.blue], [filters.blue]);
  const alphaVal = React.useMemo(() => [filters.alpha], [filters.alpha]);
  const hueVal = React.useMemo(() => [filters.hue], [filters.hue]);
  const saturationVal = React.useMemo(
    () => [filters.saturation],
    [filters.saturation]
  );
  const luminanceVal = React.useMemo(
    () => [filters.luminance],
    [filters.luminance]
  );
  const valueVal = React.useMemo(() => [filters.value], [filters.value]);

  return (
    <div className="p-3 flex flex-col gap-6">
      {/* Enhance -- NOTE: not for now */}
      {/* <EditorSlider
        id="enhance"
        label={`Enhance (${filters.enhance.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={enhanceVal}
        onValueChange={onEnhance}
      /> */}

      {/* Brightness */}
      <EditorSlider
        id="brightness"
        label={`Brightness (${filters.brightness.toFixed(2)})`}
        min={-1}
        max={1}
        step={0.01}
        value={brightnessVal}
        onValueChange={onBrightness}
        defaultValue={[defaultFilters.brightness]}
      />

      {/* Contrast */}
      <EditorSlider
        id="contrast"
        label={`Contrast (${filters.contrast.toFixed(0)})`}
        min={-100}
        max={100}
        step={1}
        value={contrastVal}
        onValueChange={onContrast}
        defaultValue={[defaultFilters.contrast]}
      />

      {/* Blur */}
      <EditorSlider
        id="blur"
        label={`Blur (${filters.blurRadius.toFixed(0)})`}
        min={0}
        max={50}
        step={1}
        value={blurVal}
        onValueChange={onBlur}
        defaultValue={[defaultFilters.blurRadius]}
      />

      {/* Noise */}
      <EditorSlider
        id="noise"
        label={`Noise (${filters.noise.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={noiseVal}
        onValueChange={onNoise}
        defaultValue={[defaultFilters.noise]}
      />

      {/* Pixelate */}
      <EditorSlider
        id="pixelate"
        label={`Pixel size (${filters.pixelSize.toFixed(0)})`}
        min={0}
        max={50}
        step={1}
        value={pixelSizeVal}
        onValueChange={onPixelSize}
        defaultValue={[defaultFilters.pixelSize]}
      />

      {/* Threshold */}
      <EditorSlider
        id="threshold"
        label={`Threshold (${filters.threshold.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={thresholdVal}
        onValueChange={onThreshold}
        defaultValue={[defaultFilters.threshold]}
      />

      {/* Posterize levels */}
      <EditorSlider
        id="levels"
        label={`Posterize (${filters.levels.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={levelsVal}
        onValueChange={onLevels}
        defaultValue={[defaultFilters.levels]}
      />

      {/* RGBA */}
      <EditorSlider
        id="red"
        label={
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Red (+{filters.red.toFixed(0)})</span>
          </div>
        }
        min={0}
        max={255}
        step={1}
        value={redVal}
        onValueChange={onRed}
        defaultValue={[defaultFilters.red]}
      />
      <EditorSlider
        id="green"
        label={
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Green (+{filters.green.toFixed(0)})</span>
          </div>
        }
        min={0}
        max={255}
        step={1}
        value={greenVal}
        onValueChange={onGreen}
        defaultValue={[defaultFilters.green]}
      />
      <EditorSlider
        id="blue"
        label={
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>
              Blue (+
              {filters.blue.toFixed(0)})
            </span>
          </div>
        }
        min={0}
        max={255}
        step={1}
        value={blueVal}
        onValueChange={onBlue}
        defaultValue={[defaultFilters.blue]}
      />
      {/* <EditorSlider
        id="alpha"
        label={`Alpha (${filters.alpha.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={alphaVal}
        onValueChange={onAlpha}
      /> */}

      {/* HSL */}
      <EditorSlider
        id="hue"
        label={`Hue (${filters.hue.toFixed(0)})`}
        min={-180}
        max={180}
        step={1}
        value={hueVal}
        onValueChange={onHue}
        defaultValue={[defaultFilters.hue]}
      />
      <EditorSlider
        id="saturation"
        label={`Saturation (${filters.saturation.toFixed(2)})`}
        min={-2}
        max={2}
        step={0.01}
        value={saturationVal}
        onValueChange={onSaturation}
        defaultValue={[defaultFilters.saturation]}
      />
      <EditorSlider
        id="luminance"
        label={`Luminance (${filters.luminance.toFixed(2)})`}
        min={-1}
        max={1}
        step={0.01}
        value={luminanceVal}
        onValueChange={onLuminance}
        defaultValue={[defaultFilters.luminance]}
      />

      {/* HSV Value */}
      <EditorSlider
        id="value"
        label={`HSV Value (${filters.value.toFixed(0)})`}
        min={0}
        max={10}
        step={0.2}
        value={valueVal}
        onValueChange={onValue}
        defaultValue={[defaultFilters.value]}
      />
    </div>
  );
}
