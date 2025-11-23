import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '../../../../types';

const TextStroke = memo(
  (props: {
    strokeColor?: HexColor;
    strokeWidth?: number;
    widgetId: string;
  }) => {
    const updateWidget = useEditorStore((state) => state.updateWidget);
    const [localStrokeColor, setLocalStrokeColor] = useState(props.strokeColor);
    const [localStrokeWidth, setLocalStrokeWidth] = useState(
      props.strokeWidth || 0
    );
    const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setLocalStrokeColor(props.strokeColor);
    }, [props.strokeColor]);

    useEffect(() => {
      setLocalStrokeWidth(props.strokeWidth || 0);
    }, [props.strokeWidth]);

    useEffect(() => {
      return () => {
        if (commitTimeoutRef.current) {
          clearTimeout(commitTimeoutRef.current);
        }
      };
    }, []);

    const commitChanges = useCallback(() => {
      updateWidget<'text'>(props.widgetId, {
        strokeColor: localStrokeColor,
        strokeWidth: localStrokeWidth,
      });
    }, [updateWidget, props.widgetId, localStrokeColor, localStrokeWidth]);

    const debouncedCommit = useCallback(() => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = setTimeout(commitChanges, 100);
    }, [commitChanges]);

    const handleStrokeColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalStrokeColor(e.target.value as HexColor);
        debouncedCommit();
      },
      [debouncedCommit]
    );

    const handleStrokeWidthChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        setLocalStrokeWidth(isNaN(newSize) ? 0 : newSize);
        debouncedCommit();
      },
      [debouncedCommit]
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
            value={localStrokeWidth}
          />
        </div>
        {/* Color */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            onChange={handleStrokeColorChange}
            value={localStrokeColor}
          />
        </div>
      </div>
    );
  }
);
TextStroke.displayName = 'TextStroke';

export default TextStroke;
