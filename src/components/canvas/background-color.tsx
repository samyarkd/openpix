import { Layer, Rect } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import { computePaddingAndScale } from '~/store/utils/geometry';

const BackgroundColor = () => {
  const { backgroundColor, stageW, stageH, stageScale } = useEditorStore(
    useShallow((state) => ({
      backgroundColor: state.backgroundColor,
      stageW: state.stageW,
      stageH: state.stageH,
      stageScale: state.stageScale,
    }))
  );

  return (
    <>
      {backgroundColor && (
        <Layer>
          <Rect
            width={computePaddingAndScale(stageW, stageScale) * 1.3}
            height={computePaddingAndScale(stageH, stageScale) * 1.3}
            fill={backgroundColor}
            listening={false}
          />
        </Layer>
      )}
    </>
  );
};

export default BackgroundColor;
