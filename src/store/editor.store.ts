import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { EditorStore } from './editor.types'
import { createCanvasSlice } from './slices/canvas.slice'
import { createCropSlice } from './slices/crop.slice'
import { createStageSlice } from './slices/stage.slice'
import { createUiSlice } from './slices/ui.slice'
import { createWidgetSlice } from './slices/widgets.slice'

export const useEditorStore = create<EditorStore>()(
  devtools(
    immer((...a) => ({
      ...createCanvasSlice(...a),
      ...createCropSlice(...a),
      ...createUiSlice(...a),
      ...createWidgetSlice(...a),
      ...createStageSlice(...a),
    }))
  )
);

export { defaultFilters } from './editor.types'
export type { EditorTab, FiltersState, ImageItem } from './editor.types'

