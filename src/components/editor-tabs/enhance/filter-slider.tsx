import React, { startTransition } from 'react';
import {
  defaultFilters,
  FiltersState,
  useEditorStore,
} from '~/store/editor.store';
import { EditorSlider } from '../editor-slider';

export function FilterSlider<K extends keyof FiltersState>(props: {
  filterKey: K;
  id: string;
  label: (v: number) => React.ReactNode;
  min: number;
  max: number;
  step: number;
  className?: string;
}) {
  const { filterKey, id, label, min, max, step, className } = props;

  // Subscribe only to the single filter numeric value
  const value = useEditorStore((s) => {
    const img = s.widgets
      .filter((w) => w.type === 'image')
      .find((i) => i.id === s.selectedWidgetId);
    const v = img
      ? (img.filters[filterKey] as number)
      : (defaultFilters[filterKey] as number);
    return v;
  });

  const handleChange = React.useCallback(
    (arr: number[]) => {
      const v = arr[0];
      const { selectedWidgetId, setImageFilters } = useEditorStore.getState();
      if (selectedWidgetId) {
        startTransition(() =>
          setImageFilters(selectedWidgetId, {
            [filterKey]: v,
          } as Partial<FiltersState>)
        );
      }
    },
    [filterKey]
  );

  return (
    <EditorSlider
      id={id}
      label={label(value)}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={handleChange}
      defaultValue={[defaultFilters[filterKey] as number]}
      className={className}
    />
  );
}
