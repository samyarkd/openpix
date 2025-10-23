import { Type } from 'lucide-react';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

const TypographyList = memo(() => {
  const { addWidget } = useEditorStore(
    useShallow((state) => ({
      addWidget: state.addWidget,
    }))
  );

  return (
    <div>
      <Button
        onClick={() =>
          addWidget<'text'>({
            type: 'text',
            text: 'New text',
            fill: '#000000',
            fontSize: 48,
            align: 'left',
          })
        }
        className="w-full"
        variant="outline"
      >
        Insert Text <Type />
      </Button>
    </div>
  );
});
TypographyList.displayName = 'TypographyList';

export default TypographyList;
