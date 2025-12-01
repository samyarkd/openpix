import { useShallow } from 'zustand/shallow';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

const ChangeLayers = () => {
  const {
    moveWidgetUp,
    moveWidgetDown,
    moveWidgetToFront,
    moveWidgetToBack,
    selectedWidgetIds,
    widgets,
  } = useEditorStore(
    useShallow((s) => ({
      moveWidgetUp: s.moveWidgetUp,
      moveWidgetDown: s.moveWidgetDown,
      moveWidgetToFront: s.moveWidgetToFront,
      moveWidgetToBack: s.moveWidgetToBack,
      selectedWidgetIds: s.selectedWidgetIds,
      widgets: s.widgets,
    }))
  );

  const selectedId =
    selectedWidgetIds.length === 1 ? selectedWidgetIds[0] : null;
  const canMoveDown =
    selectedId && widgets.findIndex((w) => w.id === selectedId) > 0;
  const canMoveUp =
    selectedId &&
    widgets.findIndex((w) => w.id === selectedId) < widgets.length - 1;

  if (!selectedId) {
    return (
      <div className="p-3 text-center text-muted-foreground">
        Select a widget to manage layers
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">Layer Controls</h3>
      <div className="grid grid-cols-4 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetToFront(selectedId)}
          disabled={!canMoveUp}
        >
          <ArrowUpToLine className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetUp(selectedId)}
          disabled={!canMoveUp}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetDown(selectedId)}
          disabled={!canMoveDown}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetToBack(selectedId)}
          disabled={!canMoveDown}
        >
          <ArrowDownToLine className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChangeLayers;
