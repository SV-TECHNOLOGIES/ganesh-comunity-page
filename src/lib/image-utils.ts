/**
 * Image Optimization Utilities
 * Routes image requests through the native Sharp WebP optimization API with disk caching.
 * Reduces 20MB+ DSLR camera files down to ~25KB thumbnails and ~160KB HD previews.
 */

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    /\.(mp4|mov|webm|avi|mkv|m4v|flv|wmv|ogv)(\?|$)/i.test(url.trim()) ||
    url.includes('youtube.com') ||
    url.includes('youtu.be')
  );
}

export function getOptimizedImageUrl(
  url: string | null | undefined,
  width = 450,
  quality = 75
): string {
  if (!url) return '/assets/poster.jpg';
  
  const trimmed = url.trim();
  if (!trimmed) return '/assets/poster.jpg';

  // Do not optimize videos, documents, or external album links
  if (
    trimmed.startsWith('data:') ||
    isVideoUrl(trimmed) ||
    /\.(mp3|wav|ogg|pdf|zip|tar|gz)(\?|$)/i.test(trimmed) ||
    trimmed.includes('photos.app.goo.gl') ||
    trimmed.includes('photos.google.com') ||
    trimmed.includes('drive.google.com') ||
    trimmed.includes('dropbox.com')
  ) {
    return trimmed;
  }

  // If the image is already a pre-generated WebP thumbnail in file storage, serve directly
  if (trimmed.endsWith('_thumb.webp')) {
    return trimmed;
  }

  // Route valid HTTP/HTTPS or local public assets through the optimizer
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return `/api/media/image-optimize?url=${encodeURIComponent(trimmed)}&w=${width}&q=${quality}`;
  }

  return trimmed;
}

/**
 * Returns the original uncompressed source image URL from any optimized URL.
 * Ensures downloads always receive the raw full-resolution camera original.
 */
export function getOriginalImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('/api/media/image-optimize?')) {
    try {
      const match = trimmed.match(/[?&]url=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch {}
  }
  return trimmed;
}
