import { Type } from 'lucide-react';
import { memo } from 'react';
import { useTheme } from 'next-themes';
import { useShallow } from 'zustand/shallow';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

const TypographyList = memo(() => {
  const { resolvedTheme } = useTheme();
  const { addWidget } = useEditorStore(
    useShallow((state) => ({
      addWidget: state.addWidget,
    }))
  );

  const textColor = resolvedTheme === 'dark' ? '#ffffff' : '#000000';

  return (
    <div>
      <Button
        onClick={() =>
          addWidget<'text'>({
            type: 'text',
            text: 'New text',
            fill: textColor,
            fontSize: 48,
            align: 'left',
            shadowColor: '#000000',
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowEnabled: false,
            shadowBlur: 5,
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
