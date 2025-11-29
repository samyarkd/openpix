import { memo, useCallback } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '~/types';

type ColorSizeControlsProps = {
  widgetId: string;
  fontSize: number;
  fill: HexColor;
};

export const ColorSizeControls = memo(
  ({ widgetId, fontSize, fill }: ColorSizeControlsProps) => {
    const updateWidget = useEditorStore((state) => state.updateWidget);

    const handleColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateWidget<'text'>(widgetId, { fill: e.target.value as HexColor });
      },
      [updateWidget, widgetId]
    );

    const handleSizeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        updateWidget<'text'>(widgetId, {
          fontSize: isNaN(newSize) ? 48 : newSize,
        });
      },
      [updateWidget, widgetId]
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
            value={fontSize}
          />
        </div>
        {/* Color */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            onChange={handleColorChange}
            value={fill}
          />
        </div>
      </div>
    );
  }
);
ColorSizeControls.displayName = 'ColorSizeControls';
