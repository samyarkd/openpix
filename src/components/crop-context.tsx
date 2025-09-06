'use client';

import React from 'react';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Rotation in degrees clockwise */
  rotation: number;
}

export const defaultCrop: CropArea = { x: 0, y: 0, width: 0, height: 0, rotation: 0 };

interface CropContextType {
  crop: CropArea;
  setCrop: React.Dispatch<React.SetStateAction<CropArea>>;
  resetCrop: () => void;
}

const CropContext = React.createContext<CropContextType | null>(null);

export function useCrop() {
  const ctx = React.useContext(CropContext);
  if (!ctx) throw new Error('useCrop must be used within <CropProvider>');
  return ctx;
}

export function CropProvider({ children }: { children: React.ReactNode }) {
  const [crop, setCrop] = React.useState<CropArea>(defaultCrop);
  const resetCrop = React.useCallback(() => setCrop(defaultCrop), []);

  return (
    <CropContext.Provider value={{ crop, setCrop, resetCrop }}>
      {children}
    </CropContext.Provider>
  );
}
