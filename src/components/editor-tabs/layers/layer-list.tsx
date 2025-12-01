import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import LayerItem from './layer-item';

const LayerList = () => {
  const {
    widgets,
    selectedWidgetIds,
    moveWidgetToFront,
    moveWidgetToBack,
    moveWidgetUp,
    moveWidgetDown,
  } = useEditorStore(
    useShallow((state) => ({
      widgets: state.widgets,
      selectedWidgetIds: state.selectedWidgetIds,
      moveWidgetToFront: state.moveWidgetToFront,
      moveWidgetToBack: state.moveWidgetToBack,
      moveWidgetUp: state.moveWidgetUp,
      moveWidgetDown: state.moveWidgetDown,
    }))
  );

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');

    if (!draggedId) return;

    // Find the original index of the dragged widget
    const draggedIndex = widgets.findIndex((w) => w.id === draggedId);
    if (draggedIndex === -1) return;

    // Since we display widgets in reverse order, we need to adjust the target index
    const actualTargetIndex = widgets.length - 1 - targetIndex;

    if (draggedIndex === actualTargetIndex) return;

    // Move to front (top of stack) or back (bottom of stack) based on position
    if (actualTargetIndex === 0) {
      moveWidgetToFront(draggedId);
    } else if (actualTargetIndex === widgets.length - 1) {
      moveWidgetToBack(draggedId);
    } else {
      // For intermediate positions, we can use moveWidgetUp/moveWidgetDown
      // This is a simplified implementation - in a real app you might want more precise reordering
      const steps = actualTargetIndex - draggedIndex;
      if (steps > 0) {
        for (let i = 0; i < steps; i++) {
          moveWidgetDown(draggedId);
        }
      } else {
        for (let i = 0; i < Math.abs(steps); i++) {
          moveWidgetUp(draggedId);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Display widgets in reverse order (top layer first)
  const reversedWidgets = [...widgets].reverse();

  if (widgets.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No widgets on canvas
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <h3 className="text-sm font-medium mb-2">Layers</h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {reversedWidgets.map((widget, index) => (
          <div
            key={widget.id}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
          >
            <LayerItem
              widget={widget}
              isSelected={selectedWidgetIds.includes(widget.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerList;
