import { useId } from 'react';
import { useShallow } from 'zustand/shallow';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { googleFonts } from '~/constants';
import { useEditorStore } from '~/store/editor.store';
import { TextWidget } from '~/store/editor.types';

const FontsList = (props: { widget: TextWidget }) => {
  const id = useId();
  const updateWidget = useEditorStore(
    useShallow((state) => state.updateWidget)
  );

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Fonts</Label>
      <Select
        name={id}
        onValueChange={(value) =>
          updateWidget<'text'>(props.widget.id, { fontFamily: value })
        }
        defaultValue={props.widget.fontFamily}
      >
        <SelectTrigger
          className="w-full"
          style={{ fontFamily: props.widget.fontFamily }}
        >
          <SelectValue placeholder="Select Font" />
        </SelectTrigger>
        <SelectContent>
          {googleFonts.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontsList;
