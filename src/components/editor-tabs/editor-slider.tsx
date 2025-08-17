import { Label } from '~/components/ui/label';
import { Slider } from '~/components/ui/slider';

interface EditorSliderProps {
  id: string;
  label: string;
  max?: number;
  min?: number;
  step?: number;
  defaultValue?: number[];
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export function EditorSlider({
  id,
  label,
  max = 100,
  min = 0,
  step = 1,
  defaultValue = [50],
  value,
  onValueChange,
  className = '',
}: EditorSliderProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Slider
        id={id}
        max={max}
        min={min}
        step={step}
        title={label}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
      />
    </div>
  );
}
