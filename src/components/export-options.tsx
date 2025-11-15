import Konva from 'konva';
import { DownloadIcon, SlidersHorizontalIcon } from 'lucide-react';
import { RefObject, useCallback, useEffect, useState } from 'react';

import { useShallow } from 'zustand/shallow';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { downloadStage } from '~/lib/export-image';
import { useEditorStore } from '~/store/editor.store';

const ExportOptions = (props: { stageRef: RefObject<Konva.Stage | null> }) => {
  const stageRef = props.stageRef;
  const { stageH, stageW, frameCrop } = useEditorStore(
    useShallow((state) => ({
      stageW: state.stageW,
      stageH: state.stageH,
      frameCrop: state.frameCrop,
    }))
  );

  // Export options
  const [exportMime, setExportMime] = useState<
    'image/png' | 'image/jpeg' | 'image/webp'
  >('image/png');
  const [exportScale, setExportScale] = useState<'1' | '2' | '3' | 'dpr'>(
    'dpr'
  );

  const handleDownload = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Hide crop rectangle for export
    const cropLayer = stage.findOne('#crop-layer');
    if (cropLayer) cropLayer.hide();
    stage.batchDraw();
    try {
      const desiredScale =
        exportScale === 'dpr'
          ? typeof window !== 'undefined'
            ? window.devicePixelRatio || 1
            : 1
          : Number(exportScale);
      const ext = exportMime.split('/')[1];
      const quality = exportMime === 'image/png' ? 1 : 0.92;
      // Adjust pixelRatio for selected crop area
      const pixelRatio = stageW > 0 ? (stageW * desiredScale) / stageH : 1;
      console.log('stageW', 'stageH');

      await downloadStage(stage, `export.${ext}`, {
        mimeType: exportMime,
        pixelRatio,
        quality,
        x: 0,
        y: 0,
        width: frameCrop?.width ?? stageW,
        height: frameCrop?.height ?? stageH,
      });
    } catch {
      // no-op
    }
    // Restore crop rectangle
    if (cropLayer) cropLayer.show();
    stage.batchDraw();
  }, [exportScale, exportMime, stageW, stageH]);

  // Keyboard: Ctrl/Cmd+S to export when an image is loaded
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownload();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDownload]);

  return (
    <div className="absolute bottom-2 right-2 z-20 flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="backdrop-blur-2xl"
        onClick={handleDownload}
      >
        <DownloadIcon className="mr-2" /> Export
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            aria-label="Export options"
            className="backdrop-blur-2xl"
          >
            <SlidersHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Format</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={exportMime}
            onValueChange={(v) =>
              setExportMime(v as 'image/png' | 'image/jpeg' | 'image/webp')
            }
          >
            <DropdownMenuRadioItem value="image/png">
              PNG (.png)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="image/jpeg">
              JPEG (.jpg)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="image/webp">
              WebP (.webp)
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Scale</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={exportScale}
            onValueChange={(v) => setExportScale(v as '1' | '2' | '3' | 'dpr')}
          >
            <DropdownMenuRadioItem value="1">1x</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="3">3x</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dpr">
              Match device pixel ratio
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportOptions;
