import { memo, useCallback } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '~/types';

const TextStroke = memo(
  (props: {
    strokeColor?: HexColor;
    strokeWidth?: number;
    widgetId: string;
  }) => {
    const updateWidget = useEditorStore((state) => state.updateWidget);

    const handleStrokeColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateWidget<'text'>(props.widgetId, {
          strokeColor: e.target.value as HexColor,
        });
      },
      [updateWidget, props.widgetId]
    );

    const handleStrokeWidthChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        updateWidget<'text'>(props.widgetId, {
          strokeWidth: isNaN(newSize) ? 0 : newSize,
        });
      },
      [updateWidget, props.widgetId]
    );

    return (
      <div className="flex gap-2">
        {/* Size */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="size">Stroke Width</Label>
          <Input
            id="size"
            type="number"
            onChange={handleStrokeWidthChange}
            value={props.strokeWidth || 0}
          />
        </div>
        {/* Color */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            onChange={handleStrokeColorChange}
            value={props.strokeColor}
          />
        </div>
      </div>
    );
  }
);
TextStroke.displayName = 'TextStroke';

export default TextStroke;
