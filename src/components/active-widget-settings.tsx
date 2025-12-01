import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import EditSelectedText from './editor-tabs/type/edit-selected-text';
import EnhanceImage from './editor-tabs/enhance/EnhanceImage';
import ChangeLayers from './editor-tabs/active-w/ChangeLayers';

const ActiveWidgetSettings = () => {
  const { selectedWidgetType } = useEditorStore(
    useShallow((s) => ({
      selectedWidgetType: s.widgets.find((i) => i.id === s.selectedWidgetId)
        ?.type,
    }))
  );

  return (
    <div className="flex flex-col gap-3 p-1">
      {/* Change widget layers (up/down) */}
      <ChangeLayers />
      <hr />
      {selectedWidgetType === 'text' && <EditSelectedText />}
      {selectedWidgetType === 'image' && <EnhanceImage />}
    </div>
  );
};

export default ActiveWidgetSettings;
