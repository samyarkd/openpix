import { useEffect, useRef, useState } from 'react';

import { loadImage } from '~/lib/load-image';

export type ImageStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export interface UseImageOptions {
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  referrerPolicy?: ReferrerPolicy;
  decode?: boolean;
}

export function useImage(
  src: string | null | undefined,
  options: UseImageOptions = {}
): [HTMLImageElement | null, ImageStatus] {
  const { crossOrigin, referrerPolicy, decode = true } = options;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<ImageStatus>('idle');
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    // SSR guard
    if (typeof window === 'undefined') {
      setImage(null);
      setStatus('idle');
      return () => {
        active.current = false;
      };
    }

    if (!src) {
      setImage(null);
      setStatus('idle');
      return () => {
        active.current = false;
      };
    }

    setStatus('loading');

    let cancelled = false;
    loadImage(src, { crossOrigin, referrerPolicy, decode })
      .then((img) => {
        if (!cancelled && active.current) {
          setImage(img);
          setStatus('loaded');
        }
      })
      .catch(() => {
        if (!cancelled && active.current) {
          setImage(null);
          setStatus('failed');
        }
      });

    return () => {
      cancelled = true;
      active.current = false;
    };
  }, [src, crossOrigin, referrerPolicy, decode]);

  return [image, status];
}
