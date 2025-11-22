import { ImageUpIcon } from 'lucide-react';
import {
  ChangeEventHandler,
  DragEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/shallow';
import { useEditorStore } from '~/store/editor.store';

const ImageDropZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const addImageWidget = useEditorStore(
    useShallow((state) => state.addImageWidget)
  );

  const onSelect = useCallback(
    (url: string) => {
      addImageWidget(url);
    },
    [addImageWidget]
  );

  // Handle drag events
  const handleDragEnter: DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      dragCounter.current += 1;
    }
    setIsDragging(true);
  };

  const handleDragLeave: DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver: DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop: DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          onSelect?.(url);
        }
      });
    }
  };

  // Handle file selection via click (for fallback)
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          onSelect?.(url);
        }
      });
    }
  };

  // Click to open file dialog
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Reset dragging state on global drop/dragend for robustness
  useEffect(() => {
    const reset = () => {
      dragCounter.current = 0;
      setIsDragging(false);
    };
    window.addEventListener('drop', reset);
    window.addEventListener('dragend', reset);
    return () => {
      window.removeEventListener('drop', reset);
      window.removeEventListener('dragend', reset);
    };
  }, []);

  return (
    <button
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="h-full flex-col flex items-center justify-center z-10 relative w-full gap-2 py-8 cursor-pointer hover:bg-accent focus:bg-accent active:bg-accent/80 rounded-lg"
    >
      <ImageUpIcon
        className="opacity-60 text-4xl"
        width={100}
        height={100}
        size={100}
      />
      <p>
        {isDragging
          ? 'Drop the images here!'
          : 'Drag & drop images or click to select'}
      </p>
      <p className="text-xs text-card-foreground italic">
        The image will not be uploaded to a server
      </p>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
    </button>
  );
};

export default ImageDropZone;
