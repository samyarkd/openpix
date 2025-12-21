import { Layer, Rect } from 'react-konva';
import { useSelection } from '~/hooks/use-selection';

const SelectionRectangle = () => {
  const { selectionRect } = useSelection();

  return (
    <>
      {selectionRect.visible && (
        <Layer>
          <Rect
            x={Math.min(selectionRect.x1, selectionRect.x2)}
            y={Math.min(selectionRect.y1, selectionRect.y2)}
            width={Math.abs(selectionRect.x2 - selectionRect.x1)}
            height={Math.abs(selectionRect.y2 - selectionRect.y1)}
            fill="rgba(0, 90, 255, 0.15)"
            stroke="rgba(0,90,255,0.6)"
            dash={[4, 4]}
          />
        </Layer>
      )}
    </>
  );
};

export default SelectionRectangle;
