import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '../../../../types';

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
    const [localShadowEnabled, setLocalShadowEnabled] = useState(
      props.shadowEnabled
    );
    const [localShadowBlur, setLocalShadowBlur] = useState(props.shadowBlur);
    const [localShadowColor, setLocalShadowColor] = useState(props.shadowColor);
    const [localShadowOffsetX, setLocalShadowOffsetX] = useState(
      props.shadowOffsetX
    );
    const [localShadowOffsetY, setLocalShadowOffsetY] = useState(
      props.shadowOffsetY
    );
    const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setLocalShadowEnabled(props.shadowEnabled);
    }, [props.shadowEnabled]);

    useEffect(() => {
      setLocalShadowBlur(props.shadowBlur);
    }, [props.shadowBlur]);

    useEffect(() => {
      setLocalShadowColor(props.shadowColor);
    }, [props.shadowColor]);

    useEffect(() => {
      setLocalShadowOffsetX(props.shadowOffsetX);
    }, [props.shadowOffsetX]);

    useEffect(() => {
      setLocalShadowOffsetY(props.shadowOffsetY);
    }, [props.shadowOffsetY]);

    useEffect(() => {
      return () => {
        if (commitTimeoutRef.current) {
          clearTimeout(commitTimeoutRef.current);
        }
      };
    }, []);

    const commitChanges = useCallback(() => {
      updateWidget<'text'>(props.widgetId, {
        shadowEnabled: localShadowEnabled,
        shadowBlur: localShadowBlur,
        shadowColor: localShadowColor,
        shadowOffsetX: localShadowOffsetX,
        shadowOffsetY: localShadowOffsetY,
      });
    }, [
      updateWidget,
      props.widgetId,
      localShadowEnabled,
      localShadowBlur,
      localShadowColor,
      localShadowOffsetX,
      localShadowOffsetY,
    ]);

    const debouncedCommit = useCallback(() => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = setTimeout(commitChanges, 100);
    }, [commitChanges]);

    const handleShadowEnabledChange = useCallback(
      (checked: boolean) => {
        setLocalShadowEnabled(checked);
        updateWidget<'text'>(props.widgetId, { shadowEnabled: checked }); // Immediate for toggle
      },
      [updateWidget, props.widgetId]
    );

    const handleShadowBlurChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalShadowBlur(Number(e.target.value));
        debouncedCommit();
      },
      [debouncedCommit]
    );

    const handleShadowColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalShadowColor(e.target.value as HexColor);
        debouncedCommit();
      },
      [debouncedCommit]
    );

    const handleShadowOffsetXChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalShadowOffsetX(Number(e.target.value));
        debouncedCommit();
      },
      [debouncedCommit]
    );

    const handleShadowOffsetYChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalShadowOffsetY(Number(e.target.value));
        debouncedCommit();
      },
      [debouncedCommit]
    );

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="text-shadow-enabled"
            checked={localShadowEnabled}
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
                  value={localShadowBlur}
                  onChange={handleShadowBlurChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="text-shadow-color">Color</Label>
                <Input
                  id="text-shadow-color"
                  type="color"
                  value={localShadowColor}
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
                  value={localShadowOffsetX}
                  onChange={handleShadowOffsetXChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="text-shadow-offset-y">Offset Y</Label>
                <Input
                  id="text-shadow-offset-y"
                  type="number"
                  value={localShadowOffsetY}
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
