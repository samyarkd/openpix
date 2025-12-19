import { GripVertical } from 'lucide-react'
import { useShallow } from 'zustand/shallow'
import { Button } from '~/components/ui/button'
import { useEditorStore } from '~/store/editor.store'
import { Widget } from '~/store/editor.types'
import WidgetPreview from './widget-preview'

interface LayerItemProps {
  widget: Widget;
  isSelected: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const LayerItem = ({ widget, isSelected, onDragStart, onDragEnd }: LayerItemProps) => {
  const { setSelectedWidgetIds, removeWidget } = useEditorStore(
    useShallow((state) => ({
      setSelectedWidgetIds: state.setSelectedWidgetIds,
      removeWidget: state.removeWidget,
    }))
  );

  const handleSelect = () => {
    setSelectedWidgetIds([widget.id]);
  };

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
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={handleSelect}
    >
      <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

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
  );
};

export default LayerItem;
