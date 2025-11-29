import * as React from 'react';

import { cn } from '~/lib/utils';
import { Label } from './label';
import { Undo2Icon } from 'lucide-react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

type InputRowProps = {
  type: React.HTMLInputTypeAttribute;
  onChange: (v?: string) => void;
  value?: string;
  label?: string;
  defaultValue?: string;
};

function InputRow(props: InputRowProps) {
  const id = React.useId();

  return (
    <div className="flex gap-2 flex-col flex-1">
      {props.label && (
        <Label className="capitalize" htmlFor={id}>
          {props.label}

          {/* Reset Icon */}
          {props.defaultValue !== props.value && (
            <Undo2Icon
              className="cursor-pointer"
              size={14}
              onClick={() => {
                props.onChange(props.defaultValue);
              }}
            />
          )}
        </Label>
      )}
      <Input
        id={id}
        type={props.type}
        onChange={(e) => {
          e.preventDefault();
          props.onChange(e.target.value);
        }}
        value={props.value}
      />
    </div>
  );
}

export { Input, InputRow };
