import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  Type,
  UnderlineIcon,
} from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';
import { HexColor } from '../../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import FontsList from './type/fonts-list';

function EditSelectedText() {
  const { updateWidget, selectedId, widget, removeWidget } = useEditorStore(
    useShallow((state) => ({
      updateWidget: state.updateWidget,
      selectedId: state.selectedWidgetId,
      widget: state.widgets.find((v) => v.id === state.selectedWidgetId),
      removeWidget: state.removeWidget,
    }))
  );

  if (!selectedId || widget?.type !== 'text') return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Remove button */}
      <Button
        onClick={(e) => {
          e.preventDefault();
          removeWidget(widget.id);
        }}
        variant="destructive"
      >
        Remove
      </Button>
      {/* Content */}
      <div className="flex gap-2 flex-col">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          onChange={(e) => {
            e.preventDefault();
            const value = e.target.value;
            updateWidget<'text'>(widget.id, { text: value });
          }}
          value={widget.text}
          placeholder="Edit the text content"
        />
      </div>
      <div className="flex gap-2">
        {/* Size */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="size">Font Size</Label>
          <Input
            id="size"
            type="number"
            onChange={(e) => {
              e.preventDefault();
              const fontSize = Number(e.target.value);

              updateWidget<'text'>(widget.id, {
                fontSize: isNaN(fontSize) ? 48 : fontSize,
              });
            }}
            value={widget.fontSize}
          />
        </div>
        {/* Color */}
        <div className="flex gap-2 flex-col flex-1">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            onChange={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, {
                fill: e.target.value as HexColor,
              });
            }}
            value={widget.fill}
          />
        </div>
      </div>
      <div className="flex gap-2">
        {/* Align */}
        <div className="flex gap-2 flex-1 justify-between">
          <Button
            onClick={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, { align: 'left' });
            }}
            variant={widget.align === 'left' ? 'outline' : 'ghost'}
          >
            <AlignLeft />
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, { align: 'center' });
            }}
            variant={widget.align === 'center' ? 'outline' : 'ghost'}
          >
            <AlignCenter />
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, { align: 'right' });
            }}
            variant={widget.align === 'right' ? 'outline' : 'ghost'}
          >
            <AlignRight />
          </Button>
        </div>
        {/* Styles */}
        <div className="flex gap-2 flex-1 justify-between flex-wrap">
          <Button
            onClick={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, {
                fontStyle:
                  widget.fontStyle === 'italic'
                    ? 'italic bold'
                    : widget.fontStyle === 'italic bold'
                      ? 'italic'
                      : widget.fontStyle === 'bold'
                        ? 'normal'
                        : 'bold',
              });
            }}
            variant={
              widget.fontStyle === 'bold' || widget.fontStyle === 'italic bold'
                ? 'outline'
                : 'ghost'
            }
          >
            <BoldIcon />
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, {
                fontStyle:
                  widget.fontStyle === 'bold'
                    ? 'italic bold'
                    : widget.fontStyle === 'italic bold'
                      ? 'bold'
                      : widget.fontStyle === 'italic'
                        ? 'normal'
                        : 'italic',
              });
            }}
            variant={
              widget.fontStyle === 'italic' ||
              widget.fontStyle === 'italic bold'
                ? 'outline'
                : 'ghost'
            }
          >
            <ItalicIcon />
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, {
                textDecoration:
                  widget.textDecoration === 'line-through'
                    ? undefined
                    : 'line-through',
              });
            }}
            variant={
              widget.textDecoration === 'line-through' ? 'outline' : 'ghost'
            }
          >
            <StrikethroughIcon />
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              updateWidget<'text'>(widget.id, {
                textDecoration:
                  widget.textDecoration === 'underline'
                    ? undefined
                    : 'underline',
              });
            }}
            variant={
              widget.textDecoration === 'underline' ? 'outline' : 'ghost'
            }
          >
            <UnderlineIcon />
          </Button>
        </div>
      </div>
      <FontsList widget={widget} />
    </div>
  );
}

function TypographyList() {
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
}

export default function TypeTab() {
  return (
    <div className="p-3 flex flex-col gap-2">
      <TypographyList />
      <hr />
      <EditSelectedText />
    </div>
  );
}
