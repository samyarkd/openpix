import Konva from 'konva'
import { useCallback } from 'react'
import { useEditorStore } from '~/store/editor.store'

export const useGlobalGroupRef = (id: string) => {
  const setGroupRef = useEditorStore((state) => state.setGroupRef);

  const refCallback = useCallback(
    (node: Konva.Group | Konva.Node | null) => {
      setGroupRef(id, node);
    },
    [id, setGroupRef]
  );

  return refCallback;
};
