import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

export function RemoveButton({ widgetId }: { widgetId: string }) {
  const removeWidget = useEditorStore((state) => state.removeWidget);

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        removeWidget(widgetId);
      }}
      variant="destructive"
      className="w-full"
    >
      Remove
    </Button>
  );
}
