'use client';

import { useShallow } from 'zustand/shallow';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

export default function LayersTab() {
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
    <div className="p-3 flex flex-col gap-4">
      <h3 className="text-sm font-medium">Layer Controls</h3>
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetToFront(selectedId)}
        >
          Bring to Front
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetUp(selectedId)}
          disabled={!canMoveUp}
        >
          Move Up
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetDown(selectedId)}
          disabled={!canMoveDown}
        >
          Move Down
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => moveWidgetToBack(selectedId)}
        >
          Send to Back
        </Button>
      </div>
    </div>
  );
}
