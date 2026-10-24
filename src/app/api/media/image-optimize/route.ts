import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
export { GET as HEAD };

// Determine safe persistent cache directory
const CACHE_DIR = (() => {
  const nextCache = path.join(process.cwd(), '.next', 'cache', 'media-optimized');
  try {
    if (!fs.existsSync(nextCache)) {
      fs.mkdirSync(nextCache, { recursive: true });
    }
    return nextCache;
  } catch {
    const tmpCache = path.join('/tmp', 'ukta-media-optimized');
    if (!fs.existsSync(tmpCache)) {
      fs.mkdirSync(tmpCache, { recursive: true });
    }
    return tmpCache;
  }
})();

/**
 * Converts a Node.js Buffer into an unshared Uint8Array.
 * Fixes: "TypeError: ArrayBuffer: SharedArrayBuffer is not allowed" in Undici / NextResponse.
 */
function toSafeResponseBytes(buf: Buffer): Uint8Array {
  const copy = new Uint8Array(buf.length);
  copy.set(buf);
  return copy;
}

/**
 * Downloads a remote image using native Node https/http.
 * Bypasses Next.js fetch interceptor to avoid:
 * "Failed to set Next.js data cache, items over 2MB can not be cached"
 */
function downloadRemoteBuffer(url: string, timeoutMs = 60000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(
      url,
      (res) => {
        // Follow redirects (301, 302, 307, 308)
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          return downloadRemoteBuffer(redirectUrl, timeoutMs).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Remote HTTP error: ${res.statusCode} ${res.statusMessage || ''}`));
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Remote download timed out'));
    });
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
  }

  // Bypass videos, audio, or documents immediately without downloading or processing with Sharp
  if (/\.(mp4|mov|webm|avi|mkv|m4v|flv|wmv|ogv|mp3|wav|ogg|pdf|zip|tar|gz)(\?|$)/i.test(rawUrl)) {
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return NextResponse.redirect(rawUrl, 302);
    }
  }

  // Parse width & quality with safe boundaries
  const parsedWidth = parseInt(searchParams.get('w') || '280', 10);
  const width = Math.min(Math.max(isNaN(parsedWidth) ? 280 : parsedWidth, 60), 1920);

  const parsedQuality = parseInt(searchParams.get('q') || '65', 10);
  const quality = Math.min(Math.max(isNaN(parsedQuality) ? 65 : parsedQuality, 30), 95);

  // Generate deterministic cache key
  const cacheKey = crypto
    .createHash('sha256')
    .update(`${rawUrl}_w${width}_q${quality}`)
    .digest('hex');
  const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.webp`);

  // 1. FAST PATH: Return from disk cache (< 5ms)
  try {
    if (fs.existsSync(cacheFilePath)) {
      const cached = await fs.promises.readFile(cacheFilePath);
      return new NextResponse(toSafeResponseBytes(cached), {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'HIT',
        },
      });
    }
  } catch (err) {
    console.warn('[IMAGE OPTIMIZE] Cache read error:', err);
  }

  // 2. SLOW PATH: Fetch source image, optimize with Sharp, and cache to disk
  try {
    let sourceBuffer: Buffer;
    const sourceKey = crypto.createHash('sha256').update(rawUrl).digest('hex');
    const sourceFilePath = path.join(CACHE_DIR, `source_${sourceKey}.bin`);

    // Check if source raw buffer was already downloaded and cached locally
    if (fs.existsSync(sourceFilePath)) {
      sourceBuffer = await fs.promises.readFile(sourceFilePath);
    } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      sourceBuffer = await downloadRemoteBuffer(rawUrl);

      // Save raw source to cache in background so it never needs to be re-downloaded
      fs.promises.writeFile(sourceFilePath, sourceBuffer).catch((err) => {
        console.warn('[IMAGE OPTIMIZE] Source cache write error:', err);
      });
    } else if (rawUrl.startsWith('/')) {
      // Local public asset
      const localPath = path.join(process.cwd(), 'public', rawUrl.replace(/^\/+/, ''));
      if (!fs.existsSync(localPath)) {
        return NextResponse.json({ error: 'Local file not found' }, { status: 404 });
      }
      sourceBuffer = await fs.promises.readFile(localPath);
    } else {
      return NextResponse.json({ error: 'Invalid URL scheme' }, { status: 400 });
    }

    // Optimize using Sharp
    const optimizedBuffer = await sharp(sourceBuffer)
      .rotate() // auto-orient based on EXIF orientation tag
      .resize({
        width,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    // Write to disk cache in background
    fs.promises.writeFile(cacheFilePath, optimizedBuffer).catch((err) => {
      console.warn('[IMAGE OPTIMIZE] Cache write error:', err);
    });

    return new NextResponse(toSafeResponseBytes(optimizedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
      },
    });
  } catch (err: any) {
    if (err?.message?.includes('unsupported image format')) {
      console.warn(`[IMAGE OPTIMIZE] Non-image format detected, falling back to direct URL: ${rawUrl}`);
    } else {
      console.error('[IMAGE OPTIMIZE ERROR]:', err);
    }
    // On processing failure, redirect directly to original source URL as fallback
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return NextResponse.redirect(rawUrl, 302);
    }
    return NextResponse.json({ error: 'Image optimization failed', message: err?.message }, { status: 500 });
  }
}
