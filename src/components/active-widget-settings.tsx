import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import EditSelectedText from './editor-tabs/type/edit-selected-text';
import EnhanceImage from './editor-tabs/enhance/EnhanceImage';

const ActiveWidgetSettings = () => {
  const { selectedWidgetType } = useEditorStore(
    useShallow((s) => ({
      selectedWidgetType: s.widgets.find((i) => i.id === s.selectedWidgetId)
        ?.type,
    }))
  );

  if (selectedWidgetType === 'text') {
    return <EditSelectedText />;
  }

  if (selectedWidgetType === 'image') {
    return <EnhanceImage />;
  }

  return null;
};

export default ActiveWidgetSettings;
