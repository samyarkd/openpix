import { ImageUpIcon } from 'lucide-react';
import {
  ChangeEventHandler,
  DragEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from './ui/button';

type ImageDropZoneProps = {
  onSelect?: (url: string, file: File) => void;
};

const ImageDropZone = ({ onSelect }: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Handle drag events
  const handleDragEnter: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      dragCounter.current += 1;
    }
    setIsDragging(true);
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onSelect?.(url, file);
      }
    }
  };

  // Handle file selection via click (for fallback)
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSelect?.(url, file);
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
    <div
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="h-full flex items-center justify-center z-10 relative  w-full"
    >
      <Button
        variant="ghost"
        className="!py-10 !px-20 rounded-lg border cursor-pointer"
      >
        <ImageUpIcon size={90} />
        <p>
          {isDragging
            ? 'Drop the image here!'
            : 'Drag & drop an image or click to select'}
        </p>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageDropZone;
