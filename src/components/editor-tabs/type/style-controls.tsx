import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikethroughIcon,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { memo } from 'react';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

type StyleControlsProps = {
  widgetId: string;
  fontStyle?: string;
  textDecoration?: string;
};

export const StyleControls = memo(
  ({ widgetId, fontStyle, textDecoration }: StyleControlsProps) => {
    const updateWidget = useEditorStore((state) => state.updateWidget);

    return (
      <div className="flex gap-2 flex-1 justify-between flex-wrap">
        <Button
          onClick={(e) => {
            e.preventDefault();
            updateWidget<'text'>(widgetId, {
              fontStyle:
                fontStyle === 'italic'
                  ? 'italic bold'
                  : fontStyle === 'italic bold'
                    ? 'italic'
                    : fontStyle === 'bold'
                      ? 'normal'
                      : 'bold',
            });
          }}
          variant={
            fontStyle === 'bold' || fontStyle === 'italic bold'
              ? 'outline'
              : 'ghost'
          }
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            updateWidget<'text'>(widgetId, {
              fontStyle:
                fontStyle === 'bold'
                  ? 'italic bold'
                  : fontStyle === 'italic bold'
                    ? 'bold'
                    : fontStyle === 'italic'
                      ? 'normal'
                      : 'italic',
            });
          }}
          variant={
            fontStyle === 'italic' || fontStyle === 'italic bold'
              ? 'outline'
              : 'ghost'
          }
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            updateWidget<'text'>(widgetId, {
              textDecoration:
                textDecoration === 'line-through' ? undefined : 'line-through',
            });
          }}
          variant={textDecoration === 'line-through' ? 'outline' : 'ghost'}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            updateWidget<'text'>(widgetId, {
              textDecoration:
                textDecoration === 'underline' ? undefined : 'underline',
            });
          }}
          variant={textDecoration === 'underline' ? 'outline' : 'ghost'}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);
StyleControls.displayName = 'StyleControls';
