import { Group, Layer, Text } from 'react-konva'
import { useShallow } from 'zustand/shallow'
import ImageWithFilters from '~/components/image-with-filters'
import { useDragTransform } from '~/hooks/use-drag-transform'
import { useGlobalGroupRef } from '~/hooks/use-global-group-refs'
import { useSnapping } from '~/hooks/use-snapping'
import { useEditorStore } from '~/store/editor.store'
import { Widget } from '~/store/editor.types'

const WidgetGroup = ({ w }: { w: Widget }) => {
  const globalGroupRef = useGlobalGroupRef(w.id);

  const { snapEnabled, updateWidgetTransform } =
    useEditorStore(
      useShallow((state) => ({
        snapEnabled: state.snapEnabled,
        updateWidgetTransform: state.updateWidgetTransform,
      }))
    );

  const { handleDragMove } = useSnapping(snapEnabled);
  const { handleDragEnd, handleTransformEnd } = useDragTransform(
    updateWidgetTransform
  );

  return (
    <Group
      name="selectable object"
      key={w.id}
      id={w.id}
      draggable
      x={w.x}
      y={w.y}
      scaleX={w.scaleX}
      scaleY={w.scaleY}
      rotation={w.rotation}
      ref={globalGroupRef}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {w.type === 'image' && <ImageWithFilters image={w} />}
      {w.type === 'text' && (
        <Text
          align={w.align}
          text={w.text}
          fontSize={w.fontSize}
          fill={w.fill}
          fontStyle={w.fontStyle}
          fontFamily={w.fontFamily}
          textDecoration={w.textDecoration}
          stroke={w.strokeColor}
          strokeWidth={w.strokeWidth}
          shadowEnabled={w.shadowEnabled}
          shadowBlur={w.shadowBlur}
          shadowColor={w.shadowColor}
          shadowOffsetX={w.shadowOffsetX}
          shadowOffsetY={w.shadowOffsetY}
        />
      )}
    </Group>
  )
}

const WidgetsRenderer = () => {
  const { widgets } =
    useEditorStore(
      useShallow((state) => ({
        widgets: state.widgets,
      }))
    );

  return (
    <Layer>
      {widgets.map((w) => (
        <WidgetGroup key={w.id} w={w} />
      ))}
    </Layer>
  );
};

export default WidgetsRenderer;
