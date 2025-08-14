import { useEffect, useRef, useState } from 'react';

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
    const img = new window.Image();
    if (typeof crossOrigin !== 'undefined') img.crossOrigin = crossOrigin;
    if (typeof referrerPolicy !== 'undefined')
      img.referrerPolicy = referrerPolicy;

    const onLoad = async () => {
      try {
        if (decode && 'decode' in img && typeof img.decode === 'function') {
          // Some browsers may throw on decode for SVGs; ignore and proceed
          await img.decode().catch(() => void 0);
        }
      } finally {
        if (active.current) {
          setImage(img);
          setStatus('loaded');
        }
      }
    };

    const onError = () => {
      if (active.current) {
        setImage(null);
        setStatus('failed');
      }
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    img.src = src;

    return () => {
      active.current = false;
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
  }, [src, crossOrigin, referrerPolicy, decode]);

  return [image, status];
}
