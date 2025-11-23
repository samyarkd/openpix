import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '../../../../types';

type ColorSizeControlsProps = {
  widgetId: string;
  fontSize: number;
  fill: HexColor;
};

export const ColorSizeControls = memo(
  ({ widgetId, fontSize, fill }: ColorSizeControlsProps) => {
    const updateWidget = useEditorStore((state) => state.updateWidget);
    const [localFill, setLocalFill] = useState(fill);
    const [localFontSize, setLocalFontSize] = useState(fontSize);
    const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setLocalFill(fill);
    }, [fill]);

    useEffect(() => {
      setLocalFontSize(fontSize);
    }, [fontSize]);

    useEffect(() => {
      return () => {
        if (commitTimeoutRef.current) {
          clearTimeout(commitTimeoutRef.current);
        }
      };
    }, []);

    const commitChanges = useCallback(() => {
      updateWidget<'text'>(widgetId, {
        fill: localFill,
        fontSize: localFontSize,
      });
    }, [updateWidget, widgetId, localFill, localFontSize]);

    const debouncedCommit = useCallback(() => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = setTimeout(commitChanges, 100);
    }, [commitChanges]);

    const handleColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalFill(e.target.value as HexColor);
        debouncedCommit();
      },
      [debouncedCommit]
    );

    const handleSizeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        setLocalFontSize(isNaN(newSize) ? 48 : newSize);
        debouncedCommit();
      },
      [debouncedCommit]
    );

    return (
      <div className="flex gap-2">
        {/* Size */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="size">Font Size</Label>
          <Input
            id="size"
            type="number"
            onChange={handleSizeChange}
            value={localFontSize}
          />
        </div>
        {/* Color */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            onChange={handleColorChange}
            value={localFill}
          />
        </div>
      </div>
    );
  }
);
ColorSizeControls.displayName = 'ColorSizeControls';
