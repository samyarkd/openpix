'use client';

import { useCrop } from '~/components/crop-context';
import { Button } from '~/components/ui/button';
import { EditorSlider } from './editor-slider';

export default function CropTab() {
  const { crop, setCrop, resetCrop } = useCrop();
  return (
    <div className="flex flex-col gap-3 p-3">
      <EditorSlider
        id="rotation"
        label="Rotation"
        min={-180}
        max={180}
        step={1}
        value={[crop.rotation]}
        onValueChange={([val]) => setCrop({ ...crop, rotation: val })}
        defaultValue={[0]}
      />
      <div className="flex justify-center">
        <Button variant="outline" onClick={resetCrop}>
          Reset crop
        </Button>
      </div>
    </div>
  );
}
