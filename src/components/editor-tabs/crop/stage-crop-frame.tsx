'use client';

import { useActiveTab } from '~/hooks/use-active-tab';
import { cn } from '~/lib/utils';
import { useCropFrame } from './use-crop-frame';

const StageCropFrame = () => {
  const { activeTab } = useActiveTab();
  const { crop, handleMouseDown } = useCropFrame();

  if (!crop) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute border-2 border-dashed border-primary',
        activeTab === 'crop' ? 'block' : 'hidden'
      )}
      style={{
        width: crop?.width,
        height: crop?.height,
        left: crop?.x,
        top: crop?.y,
      }}
    >
      {/* Dev Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-primary/10 p-2 text-xs absolute -top-8 left-0">
          {Math.round(crop.width)}px * {Math.round(crop.height)}px
        </div>
      )}

      {/* Dots for resizing the frame */}
      <CropHandle
        position="top-0 left-0 -translate-x-1/2 -translate-y-1/2"
        cursor="cursor-nwse-resize"
        onMouseDown={(e) => handleMouseDown(e, 'tl')}
      />
      <CropHandle
        position="top-0 right-0 translate-x-1/2 -translate-y-1/2"
        cursor="cursor-nesw-resize"
        onMouseDown={(e) => handleMouseDown(e, 'tr')}
      />
      <CropHandle
        position="bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
        cursor="cursor-nesw-resize"
        onMouseDown={(e) => handleMouseDown(e, 'bl')}
      />
      <CropHandle
        position="bottom-0 right-0 translate-x-1/2 translate-y-1/2"
        cursor="cursor-nwse-resize"
        onMouseDown={(e) => handleMouseDown(e, 'br')}
      />
    </div>
  );
};

export default StageCropFrame;

// Helper component for handles to avoid repetition
const CropHandle = ({
  position,
  cursor,
  onMouseDown,
}: {
  position: string;
  cursor: string;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => (
  <div
    className={cn(
      'absolute w-3 h-3 bg-primary rounded-full border-2 border-background',
      position,
      cursor
    )}
    onMouseDown={onMouseDown}
  />
);
