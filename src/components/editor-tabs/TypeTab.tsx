import { Type } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import { Button } from '../ui/button';
import { AlignmentControls } from './type/alignment-controls';
import { ColorSizeControls } from './type/color-size-controls';
import { ContentSection } from './type/content-section';
import { FontsList } from './type/fonts-list';
import { RemoveButton } from './type/remove-button';
import { StyleControls } from './type/style-controls';

function EditSelectedText() {
  const { selectedId, widget } = useEditorStore(
    useShallow((state) => ({
      selectedId: state.selectedWidgetId,
      widget: state.widgets.find((v) => v.id === state.selectedWidgetId),
    }))
  );

  if (!selectedId || widget?.type !== 'text') return null;

  return (
    <div className="flex flex-col gap-4">
      <RemoveButton widgetId={widget.id} />
      <ContentSection widgetId={widget.id} content={widget.text} />
      <ColorSizeControls
        widgetId={widget.id}
        fontSize={widget.fontSize}
        fill={widget.fill}
      />
      <div className="flex gap-2">
        <AlignmentControls widgetId={widget.id} align={widget.align} />
        <StyleControls
          widgetId={widget.id}
          fontStyle={widget.fontStyle}
          textDecoration={widget.textDecoration}
        />
      </div>
      <FontsList widget={widget} />
    </div>
  );
}

function TypographyList() {
  const { addWidget } = useEditorStore(
    useShallow((state) => ({
      addWidget: state.addWidget,
    }))
  );

  return (
    <div>
      <Button
        onClick={() =>
          addWidget<'text'>({
            type: 'text',
            text: 'New text',
            fill: '#000000',
            fontSize: 48,
            align: 'left',
          })
        }
        className="w-full"
        variant="outline"
      >
        Insert Text <Type />
      </Button>
    </div>
  );
}

export default function TypeTab() {
  return (
    <div className="p-3 flex flex-col gap-2">
      <TypographyList />
      <hr />
      <EditSelectedText />
    </div>
  );
}
