import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '../../../../types';

type ColorSizeControlsProps = {
  widgetId: string;
  fontSize: number;
  fill: HexColor;
};

export function ColorSizeControls({
  widgetId,
  fontSize,
  fill,
}: ColorSizeControlsProps) {
  const updateWidget = useEditorStore((state) => state.updateWidget);

  return (
    <div className="flex gap-2">
      {/* Size */}
      <div className="flex gap-2 flex-col flex-1">
        <Label htmlFor="size">Font Size</Label>
        <Input
          id="size"
          type="number"
          onChange={(e) => {
            e.preventDefault();
            const newSize = Number(e.target.value);
            updateWidget<'text'>(widgetId, {
              fontSize: isNaN(newSize) ? 48 : newSize,
            });
          }}
          value={fontSize}
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
            updateWidget<'text'>(widgetId, {
              fill: e.target.value as HexColor,
            });
          }}
          value={fill}
          className="h-10 p-1"
        />
      </div>
    </div>
  );
}
