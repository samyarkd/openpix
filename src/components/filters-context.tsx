'use client';

import React from 'react';

export type FiltersState = {
  // Common adjustable filters
  blurRadius: number; // 0..100
  brightness: number; // -1..1 (0 = none)
  contrast: number; // -100..100 (0 = none)
  enhance: number; // 0..1
  noise: number; // 0..1
  pixelSize: number; // >= 1
  threshold: number; // 0..1
  levels: number; // Posterize levels 0..1
  // Color channels
  red: number; // 0..255
  green: number; // 0..255
  blue: number; // 0..255
  alpha: number; // 0..1
  // HSL / HSV
  hue: number; // -180..180
  saturation: number; // -2..2 (0 = none) - practical range
  luminance: number; // -1..1 (HSL)
  value: number; // 0..255 (HSV value)
};

export const defaultFilters: FiltersState = {
  blurRadius: 0,
  brightness: 0,
  contrast: 0,
  enhance: 0,
  noise: 0,
  pixelSize: 0,
  threshold: 0,
  levels: 0,
  red: 0,
  green: 0,
  blue: 0,
  alpha: 0,
  hue: 0,
  saturation: 0,
  luminance: 0,
  value: 0,
};

type FiltersContextType = {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  reset: () => void;
};

const FiltersContext = React.createContext<FiltersContextType | null>(null);

export function useFilters() {
  const ctx = React.useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within <FiltersProvider>');
  return ctx;
}

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = React.useState<FiltersState>(defaultFilters);
  const reset = React.useCallback(() => setFilters(defaultFilters), []);

  return (
    <FiltersContext.Provider value={{ filters, setFilters, reset }}>
      {children}
    </FiltersContext.Provider>
  );
}
