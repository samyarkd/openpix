import { Layer, Transformer } from 'react-konva'
import { useShallow } from 'zustand/shallow'
import { useEditorStore } from '~/store/editor.store'

const ShapeTransformer = () => {
  const setStageRefs = useEditorStore(
    useShallow((state) => state.setStageRefs)
  );

  return (
    <Layer>
      <Transformer
        ref={setStageRefs('trRef')}
        rotateEnabled
        boundBoxFunc={(oldBox, newBox) => {
          if (newBox.width < 5 || newBox.height < 5) {
            return oldBox;
          }
          return newBox;
        }}
        enabledAnchors={[
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
          'middle-left',
          'middle-right',
          'top-center',
          'bottom-center',
        ]}
      />
    </Layer>
  );
};

export default ShapeTransformer;
