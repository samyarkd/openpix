import { memo } from 'react';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { useEditorStore } from '~/store/editor.store';

type ContentSectionProps = {
  widgetId: string;
  content: string;
};

export const ContentSection = memo(
  ({ widgetId, content }: ContentSectionProps) => {
    const updateWidget = useEditorStore((state) => state.updateWidget);

    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          onChange={(e) => {
            e.preventDefault();
            updateWidget<'text'>(widgetId, { text: e.target.value });
          }}
          value={content}
          placeholder="Edit the text content"
        />
      </div>
    );
  }
);
ContentSection.displayName = 'ContentSection';
