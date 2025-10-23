import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '../../../../types';

const TextStroke = (props: {
  strokeColor?: HexColor;
  strokeWidth?: number;
  widgetId: string;
}) => {
  const updateWidget = useEditorStore((state) => state.updateWidget);

  return (
    <div className="flex gap-2">
      {/* Size */}
      <div className="flex gap-2 flex-col flex-1">
        <Label htmlFor="size">Stroke Width</Label>
        <Input
          id="size"
          type="number"
          onChange={(e) => {
            e.preventDefault();
            const newSize = Number(e.target.value);
            updateWidget<'text'>(props.widgetId, {
              strokeWidth: isNaN(newSize) ? props.strokeWidth : newSize,
            });
          }}
          value={props.strokeWidth || 0}
        />
      </div>
      {/* Color */}
      <div className="flex gap-2 flex-col flex-1">
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          onChange={(e) => {
            e.preventDefault();
            updateWidget<'text'>(props.widgetId, {
              strokeColor: e.target.value as HexColor,
            });
          }}
          value={props.strokeColor}
          className="h-10 p-1"
        />
      </div>
    </div>
  );
};

export default TextStroke;
