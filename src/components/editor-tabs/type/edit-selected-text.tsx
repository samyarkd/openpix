import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import { AlignmentControls } from './alignment-controls';
import { ColorSizeControls } from './color-size-controls';
import { ContentSection } from './content-section';
import { FontsList } from './fonts-list';
import { RemoveButton } from './remove-button';
import { StyleControls } from './style-controls';
import TextShadow from './text-shadow';
import TextStroke from './text-stroke';

const EditSelectedText = memo(() => {
  const { selectedId, widget } = useEditorStore(
    useShallow((state) => ({
      selectedId: state.selectedWidgetId,
      widget: state.widgets.find((v) => v.id === state.selectedWidgetId),
    }))
  );

  if (!selectedId || widget?.type !== 'text') return null;

  return (
    <div className="flex flex-col gap-4">
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
      <TextStroke
        strokeColor={widget.strokeColor}
        strokeWidth={widget.strokeWidth}
        widgetId={widget.id}
      />
      <TextShadow
        widgetId={widget.id}
        shadowBlur={widget.shadowBlur}
        shadowColor={widget.shadowColor}
        shadowEnabled={widget.shadowEnabled}
        shadowOffsetX={widget.shadowOffsetX}
        shadowOffsetY={widget.shadowOffsetY}
      />
      <RemoveButton widgetId={widget.id} />
    </div>
  );
});
EditSelectedText.displayName = 'EditSelectedText';

export default EditSelectedText;
