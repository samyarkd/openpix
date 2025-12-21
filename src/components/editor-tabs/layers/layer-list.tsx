import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import LayerItem from './layer-item';

const LayerList = () => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { widgets, selectedWidgetIds, moveWidgetToIndex } = useEditorStore(
    useShallow((state) => ({
      widgets: state.widgets,
      selectedWidgetIds: state.selectedWidgetIds,
      moveWidgetToIndex: state.moveWidgetToIndex,
    }))
  );

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    // Find the original index of the dragged widget
    const draggedIndex = widgets.findIndex((w) => w.id === draggedId);
    if (draggedIndex === -1) return;

    // Since we display widgets in reverse order (top layer = index 0 in display)
    // We need to convert the display index to the actual array index
    const actualTargetIndex = widgets.length - 1 - targetIndex;

    if (draggedIndex === actualTargetIndex) return;

    // Move the widget to the target index
    moveWidgetToIndex(draggedId, actualTargetIndex);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
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
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            className={`transition-all duration-200 rounded ${
              dragOverIndex === index
                ? 'bg-primary/5 border-2 border-primary/20 border-dashed'
                : ''
            }`}
          >
            <LayerItem
              widget={widget}
              isSelected={selectedWidgetIds.includes(widget.id)}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragEnd={handleDragEnd}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerList;
