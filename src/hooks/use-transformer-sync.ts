import Konva from 'konva'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { useEditorStore } from '~/store/editor.store'

export function useTransformerSync() {
  const { selectedWidgetIds, activeTab, trRef, groupRefs } = useEditorStore(
    useShallow((state) => ({
      selectedWidgetIds: state.selectedWidgetIds,
      activeTab: state.activeTab,
      trRef: state.trRef,
      groupRefs: state.groupRefs,
    }))
  );

  useEffect(() => {
    if (!trRef?.current) return;

    if (selectedWidgetIds.length) {
      const nodes = selectedWidgetIds
        .map((id) => groupRefs?.[id])
        .filter(Boolean) as Konva.Node[];
      trRef.current.nodes(nodes);
    } else {
      trRef.current.nodes([]);
    }

    trRef.current?.getLayer()?.batchDraw();
  }, [selectedWidgetIds, activeTab, trRef, groupRefs]);
}
