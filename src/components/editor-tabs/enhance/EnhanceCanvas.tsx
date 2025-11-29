import { useShallow } from 'zustand/shallow';
import { InputRow } from '~/components/ui/input';
import { useEditorStore } from '~/store/editor.store';

/**
 * This component includes options for canvas
 *
 * - Set a background color for the canvas
 */
const EnhanceCanvas = () => {
  const { setBackgroundColor, backgroundColor } = useEditorStore(
    useShallow((s) => ({
      setBackgroundColor: s.setBackgrondColor,
      backgroundColor: s.backgroundColor,
    }))
  );

  return (
    <div className="p-2">
      <InputRow
        label="Background"
        type="color"
        defaultValue={undefined}
        value={backgroundColor || undefined}
        onChange={(color) => {
          setBackgroundColor(color);
        }}
      />
    </div>
  );
};

export default EnhanceCanvas;
