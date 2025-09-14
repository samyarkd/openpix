import { Undo2Icon } from 'lucide-react';
import React, { ReactNode } from 'react';
import { Label } from '~/components/ui/label';
import { Slider } from '~/components/ui/slider';

interface EditorSliderProps {
  id: string;
  label: ReactNode;
  max?: number;
  min?: number;
  step?: number;
  defaultValue: number[];
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
}

function EditorSliderBase({
  id,
  label,
  max = 100,
  min = 0,
  step = 1,
  defaultValue,
  value,
  onValueChange,
  className = '',
}: EditorSliderProps) {
  // rAF-throttle onValueChange to ~60fps for smoother scrubbing
  const cbRef = React.useRef(onValueChange);
  React.useEffect(() => {
    cbRef.current = onValueChange;
  }, [onValueChange]);

  const rafRef = React.useRef<number | null>(null);
  const pendingRef = React.useRef<number[] | null>(null);

  const flush = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pendingRef.current && cbRef.current) {
      cbRef.current(pendingRef.current);
    }
    pendingRef.current = null;
  }, []);

  const handleChange = React.useCallback((val: number[]) => {
    pendingRef.current = val;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current && cbRef.current) {
          cbRef.current(pendingRef.current);
        }
        pendingRef.current = null;
      });
    }
  }, []);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Label htmlFor={id} className="flex items-center gap-2">
        {label}

        {defaultValue[0] !== value?.[0] && (
          <Undo2Icon
            className="cursor-pointer"
            size={14}
            onClick={() => {
              handleChange(defaultValue);
            }}
          />
        )}
      </Label>
      <Slider
        id={id}
        max={max}
        min={min}
        step={step}
        title={id}
        defaultValue={defaultValue}
        value={value}
        onValueChange={handleChange}
        // Flush pending update on pointer/key release for final precise value
        onPointerUp={flush}
        onKeyUp={flush}
      />
    </div>
  );
}

// Memoize to prevent re-render when unrelated sliders change
// We intentionally ignore `label` and `onValueChange` identity in the comparison.
// - Label updates are tied to `value` changes for that slider
// - onValueChange is stored in a ref internally
export const EditorSlider = React.memo(
  EditorSliderBase,
  (prev, next) => {
    // Compare primitives and the first numeric values only
    const sameId = prev.id === next.id;
    const sameClass = prev.className === next.className;
    const sameLimits =
      prev.min === next.min && prev.max === next.max && prev.step === next.step;
    const prevVal = prev.value?.[0];
    const nextVal = next.value?.[0];
    const sameValue = prevVal === nextVal;
    const sameDefault = prev.defaultValue?.[0] === next.defaultValue?.[0];

    return sameId && sameClass && sameLimits && sameValue && sameDefault;
  }
);
