/**
 * Load an image from a URL and return the HTMLImageElement once it's ready.
 * Mirrors the behavior and options used in the `useImage` hook, but usable outside React.
 */
export interface LoadImageOptions {
  /**
   * Sets the cross-origin request mode for the image.
   */
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  /**
   * Sets the referrer policy for the request.
   */
  referrerPolicy?: ReferrerPolicy;
  /**
   * Attempt to decode the image before resolving (defaults to true).
   */
  decode?: boolean;
  /**
   * Optional timeout in milliseconds to reject if the image takes too long to load.
   */
  timeoutMs?: number;
}

/**
 * Load an image element from a given src URL.
 *
 * - Applies `crossOrigin` and `referrerPolicy` if provided.
 * - Attempts to `decode()` the image prior to resolving when supported.
 * - Optional `timeoutMs` to guard against hanging requests.
 * - Rejects on SSR environments (no `window`).
 */
export function loadImage(
  src: string,
  options: LoadImageOptions = {}
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // SSR guard
    if (typeof window === 'undefined') {
      reject(new Error('loadImage can only run in a browser environment'));
      return;
    }

    if (!src) {
      reject(new Error('Source URL is required'));
      return;
    }

    const { crossOrigin, referrerPolicy, decode = true, timeoutMs } = options;

    const img = new window.Image();
    if (typeof crossOrigin !== 'undefined') img.crossOrigin = crossOrigin;
    if (typeof referrerPolicy !== 'undefined')
      img.referrerPolicy = referrerPolicy;

    let timer: number | undefined;

    const cleanup = () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      if (timer) window.clearTimeout(timer);
    };

    const onLoad = async () => {
      try {
        if (decode && 'decode' in img && typeof img.decode === 'function') {
          // Some browsers may throw on decode (e.g., SVGs); ignore and resolve anyway
          await img.decode().catch(() => void 0);
        }
      } finally {
        cleanup();
        resolve(img);
      }
    };

    const onError = (e?: Event | string) => {
      cleanup();
      const message = typeof e === 'string' ? e : 'Failed to load image';
      reject(new Error(message));
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);

    if (timeoutMs && timeoutMs > 0) {
      timer = window.setTimeout(
        () => onError('Image load timed out'),
        timeoutMs
      );
    }

    img.src = src;
  });
}
