import { useShallow } from 'zustand/shallow';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';
import { Widget } from '~/store/editor.types';
import WidgetPreview from './widget-preview';

interface LayerItemProps {
  widget: Widget;
  isSelected: boolean;
}

const LayerItem = ({ widget, isSelected }: LayerItemProps) => {
  const {
    setSelectedWidgetIds,
    moveWidgetUp,
    moveWidgetDown,
    widgets,
    removeWidget,
  } = useEditorStore(
    useShallow((state) => ({
      setSelectedWidgetIds: state.setSelectedWidgetIds,
      moveWidgetUp: state.moveWidgetUp,
      moveWidgetDown: state.moveWidgetDown,
      widgets: state.widgets,
      removeWidget: state.removeWidget,
    }))
  );

  const handleSelect = () => {
    setSelectedWidgetIds([widget.id]);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', widget.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const widgetIndex = widgets.findIndex((w) => w.id === widget.id);
  const canMoveUp = widgetIndex < widgets.length - 1;
  const canMoveDown = widgetIndex > 0;

  const getWidgetName = (widget: Widget) => {
    switch (widget.type) {
      case 'text':
        return widget.text.length > 20
          ? `${widget.text.substring(0, 20)}...`
          : widget.text;
      case 'image':
        return 'Image';
      case 'sticker':
        return 'Sticker';
      default:
        return 'Widget';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={handleSelect}
    >
      <div className="flex-shrink-0">
        <WidgetPreview widget={widget} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {getWidgetName(widget)}
        </div>
        <div className="text-xs text-muted-foreground capitalize">
          {widget.type}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            moveWidgetUp(widget.id);
          }}
          disabled={!canMoveUp}
        >
          <ArrowUp className="h-3 w-3" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            moveWidgetDown(widget.id);
          }}
          disabled={!canMoveDown}
        >
          <ArrowDown className="h-3 w-3" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            removeWidget(widget.id);
          }}
        >
          ×
        </Button>
      </div>
    </div>
  );
};

export default LayerItem;
