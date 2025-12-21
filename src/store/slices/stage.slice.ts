import { createRef } from 'react'
import type { SliceCreator, StageRefTypes, StageSlice } from '../editor.types'


export const createStageSlice: SliceCreator<StageSlice> = (set, get) => {
  const stageRef = createRef<StageRefTypes['stageRef']>();
  const trRef = createRef<StageRefTypes['trRef']>();

  return {
    stageRef,
    trRef,
    groupRefs: {},
    setStageRefs: (key) => (ref) => {
      if (key === 'stageRef' && ref && stageRef.current !== ref) {
        stageRef.current = ref as NonNullable<StageRefTypes['stageRef']>;
      }
      if (key === 'trRef' && ref && trRef.current !== ref) {
        trRef.current = ref as NonNullable<StageRefTypes['trRef']>;
      }
    },

    setGroupRef: (id, node) => {
      if (get().groupRefs?.[id] === node) return; 

      set((state) => {
        if (!node) {
          const newRefs = { ...state.groupRefs };
          delete newRefs[id];
          return { groupRefs: newRefs };
        }

        return {
          groupRefs: { ...state.groupRefs, [id]: node },
        };
      });
    },

    getGroupRef: (id) => {
      return get().groupRefs?.[id];
    },
  };
};
