import { useEditorStore } from '~/store/editor.store';

export const DoSomethingHint = () => {
  const widgetsLen = useEditorStore((s) => s.widgets.length);

  if (widgetsLen) {
    return null;
  }

  {
    /*A hint to user for adding something */
  }
  return (
    <div className="absolute text-center z-10 p-2 bg-background/30">
      <div>:D</div>

      <p>Upload something/Write something or do something</p>

      <p className="text-sm italic">Toggle the sidebar</p>
    </div>
  );
};
