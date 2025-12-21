import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';

export function useStageSync() {
  const { stageRef, stageW, stageH } = useEditorStore(
    useShallow((state) => ({
      stageRef: state.stageRef,
      stageW: state.stageW,
      stageH: state.stageH,
    }))
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (typeof stageW === 'number') stage.width(stageW);
    if (typeof stageH === 'number') stage.height(stageH);
    stage.batchDraw();
  }, [stageW, stageH, stageRef]);
}
