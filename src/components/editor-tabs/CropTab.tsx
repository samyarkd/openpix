'use client';

import { useShallow } from 'zustand/shallow';
import { Button } from '~/components/ui/button';
import { useEditorStore } from '~/store/editor.store';

export default function CropTab() {
  const { resetCrop } = useEditorStore(
    useShallow((state) => ({ resetCrop: state.resetCrop }))
  );

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex justify-center">
        <Button className="w-full" variant="outline" onClick={resetCrop}>
          Reset crop
        </Button>
      </div>
    </div>
  );
}
