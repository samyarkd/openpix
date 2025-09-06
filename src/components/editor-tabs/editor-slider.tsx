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

function EditorSliderImpl({
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

// Custom props comparison to avoid re-rendering when unrelated sliders change.
// - Compare arrays by value (length + item equality)
// - Compare functions by reference
// - Compare primitives/strings by value
function areEqual(prev: EditorSliderProps, next: EditorSliderProps) {
  if (prev.id !== next.id) return false;
  if (prev.label !== next.label) return false;
  if (prev.max !== next.max) return false;
  if (prev.min !== next.min) return false;
  if (prev.step !== next.step) return false;
  if (prev.className !== next.className) return false;

  const prevVal = prev.value;
  const nextVal = next.value;
  if (prevVal === nextVal) {
    // same reference or both undefined
  } else if (!prevVal || !nextVal) {
    return false;
  } else if (prevVal.length !== nextVal.length) {
    return false;
  } else {
    for (let i = 0; i < prevVal.length; i++) {
      if (prevVal[i] !== nextVal[i]) return false;
    }
  }

  const prevDef = prev.defaultValue;
  const nextDef = next.defaultValue;
  if (prevDef === nextDef) {
    // ok
  } else if (!prevDef || !nextDef) {
    return false;
  } else if (prevDef.length !== nextDef.length) {
    return false;
  } else {
    for (let i = 0; i < prevDef.length; i++) {
      if (prevDef[i] !== nextDef[i]) return false;
    }
  }

  if (prev.onValueChange !== next.onValueChange) return false;

  return true;
}

export const EditorSlider = React.memo(EditorSliderImpl, areEqual);
