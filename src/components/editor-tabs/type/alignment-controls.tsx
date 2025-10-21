import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

type AlignmentControlsProps = {
  widgetId: string;
  align: 'left' | 'center' | 'right';
};

export function AlignmentControls({ widgetId, align }: AlignmentControlsProps) {
  const updateWidget = useEditorStore((state) => state.updateWidget);

  return (
    <div className="flex gap-2 flex-1 justify-between">
      <Button
        onClick={(e) => {
          e.preventDefault();
          updateWidget<'text'>(widgetId, { align: 'left' });
        }}
        variant={align === 'left' ? 'outline' : 'ghost'}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          updateWidget<'text'>(widgetId, { align: 'center' });
        }}
        variant={align === 'center' ? 'outline' : 'ghost'}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          updateWidget<'text'>(widgetId, { align: 'right' });
        }}
        variant={align === 'right' ? 'outline' : 'ghost'}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
