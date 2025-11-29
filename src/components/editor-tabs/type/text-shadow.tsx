import { memo, useCallback } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '~/types';

const TextShadow = memo(
  (props: {
    widgetId: string;
    shadowEnabled?: boolean;
    shadowBlur?: number;
    shadowColor?: HexColor;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  }) => {
    const updateWidget = useEditorStore((state) => state.updateWidget);

    const handleShadowEnabledChange = useCallback(
      (checked: boolean) => {
        updateWidget<'text'>(props.widgetId, { shadowEnabled: checked });
      },
      [updateWidget, props.widgetId]
    );

    const handleShadowBlurChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateWidget<'text'>(props.widgetId, {
          shadowBlur: Number(e.target.value),
        });
      },
      [updateWidget, props.widgetId]
    );

    const handleShadowColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateWidget<'text'>(props.widgetId, {
          shadowColor: e.target.value as HexColor,
        });
      },
      [updateWidget, props.widgetId]
    );

    const handleShadowOffsetXChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateWidget<'text'>(props.widgetId, {
          shadowOffsetX: Number(e.target.value),
        });
      },
      [updateWidget, props.widgetId]
    );

    const handleShadowOffsetYChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateWidget<'text'>(props.widgetId, {
          shadowOffsetY: Number(e.target.value),
        });
      },
      [updateWidget, props.widgetId]
    );

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="text-shadow-enabled"
            checked={props.shadowEnabled}
            onCheckedChange={handleShadowEnabledChange}
          />
          <Label htmlFor="text-shadow-enabled">Text Shadow</Label>
        </div>
        {props.shadowEnabled && (
          <>
            <div className="flex gap-2 [&>div]:flex-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="text-shadow-blur">Blur</Label>
                <Input
                  id="text-shadow-blur"
                  type="number"
                  value={props.shadowBlur}
                  onChange={handleShadowBlurChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="text-shadow-color">Color</Label>
                <Input
                  id="text-shadow-color"
                  type="color"
                  value={props.shadowColor}
                  onChange={handleShadowColorChange}
                />
              </div>
            </div>
            <div className="flex gap-2 [&>div]:flex-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="text-shadow-offset-x">Offset X</Label>
                <Input
                  id="text-shadow-offset-x"
                  type="number"
                  value={props.shadowOffsetX}
                  onChange={handleShadowOffsetXChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="text-shadow-offset-y">Offset Y</Label>
                <Input
                  id="text-shadow-offset-y"
                  type="number"
                  value={props.shadowOffsetY}
                  onChange={handleShadowOffsetYChange}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
TextShadow.displayName = 'TextShadow';

export default TextShadow;
