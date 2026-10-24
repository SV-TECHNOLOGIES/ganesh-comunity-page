import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import http from 'http';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';

declare global {
  // Prevent duplicate worker runs during Next.js development hot-reloads
  var __albumPreCacheWorkerStarted: boolean | undefined;
}

// Hard-coded album IDs from media-backup.json with multiple images
export const BACKUP_ALBUM_IDS = [
  'cmvmnm6c80001qpotxm6pcrfh', // Bathukamma2026 (99 images)
  'cmvmmi8uu0001ageh5g68b1b0', // Bathukamma2026 (51 images)
  'cmvmm3ejx0001x3876y51yzjl', // Bathukamma2026 (51 images)
  'cmvmghpph00019k9hfakl7dpp', // Bathukamma2026 (49 images)
  'cmvma589v00015oi1s1xuo312', // Bathukamma2026 - 1 (34 images)
  'cmvmfrzyl0001rhi9iwo2sbz6', // Test (2 images)
];

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

export function downloadBuffer(url: string, timeoutMs = 180000, retries = 1): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return downloadBuffer(redirectUrl, timeoutMs, retries).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Remote HTTP error: ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', (err) => {
        if (retries > 0) {
          const fn = url.split('/').pop()?.split('?')[0] || url;
          console.warn(`[ALBUM CACHE] 🔄 Retrying download for ${fn} after error: ${err.message}`);
          downloadBuffer(url, timeoutMs, retries - 1).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
    req.on('error', (err) => {
      if (retries > 0) {
        const fn = url.split('/').pop()?.split('?')[0] || url;
        console.warn(`[ALBUM CACHE] 🔄 Retrying download for ${fn} after error: ${err.message}`);
        downloadBuffer(url, timeoutMs, retries - 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Download timed out'));
    });
  });
}

export async function cacheSingleImage(
  rawUrl: string,
  index: number,
  total: number,
  logPrefix = '[CACHE-ALBUM]'
): Promise<boolean> {
  const filename = rawUrl.split('/').pop()?.split('?')[0] || rawUrl;
  const tag = `${logPrefix} [${index + 1}/${total}]`;

  try {
    if (
      !rawUrl ||
      rawUrl.endsWith('_thumb.webp') ||
      /\.(mp4|mov|webm|avi|mkv|m4v|flv|wmv|ogv|mp3|wav|ogg|pdf|zip|tar|gz)(\?|$)/i.test(rawUrl) ||
      rawUrl.includes('photos.google.com') ||
      rawUrl.includes('drive.google.com') ||
      rawUrl.includes('dropbox.com')
    ) {
      console.log(`${tag} ⏭️  Skipping non-image/video/thumbnail URL: ${filename}`);
      return true;
    }

    const thumbKey = crypto.createHash('sha256').update(`${rawUrl}_w280_q65`).digest('hex');
    const thumbPath = path.join(CACHE_DIR, `${thumbKey}.webp`);

    const previewKey = crypto.createHash('sha256').update(`${rawUrl}_w1400_q75`).digest('hex');
    const previewPath = path.join(CACHE_DIR, `${previewKey}.webp`);

    // If both thumbnail and preview are already cached, skip immediately
    if (fs.existsSync(thumbPath) && fs.existsSync(previewPath)) {
      console.log(`${tag} ⏭️  Already cached (skipped): ${filename}`);
      return true;
    }

    const sourceKey = crypto.createHash('sha256').update(rawUrl).digest('hex');
    const sourcePath = path.join(CACHE_DIR, `source_${sourceKey}.bin`);

    let sourceBuffer: Buffer;
    if (fs.existsSync(sourcePath)) {
      console.log(`${tag} 💾 Reading from local raw cache: ${filename}`);
      sourceBuffer = await fs.promises.readFile(sourcePath);
    } else {
      console.log(`${tag} 📥 Downloading raw image: ${filename} ...`);
      const t0 = Date.now();
      sourceBuffer = await downloadBuffer(rawUrl);
      const dlSec = ((Date.now() - t0) / 1000).toFixed(1);
      const mb = (sourceBuffer.length / (1024 * 1024)).toFixed(2);
      console.log(`${tag} ⚡ Downloaded ${mb} MB in ${dlSec}s: ${filename}`);
      fs.promises.writeFile(sourcePath, sourceBuffer).catch(() => {});
    }

    const startSharp = Date.now();
    let generatedCount = 0;

    // Generate 280px grid thumbnail
    if (!fs.existsSync(thumbPath)) {
      const thumb = await sharp(sourceBuffer)
        .rotate()
        .resize({ width: 280, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 65, effort: 4 })
        .toBuffer();
      await fs.promises.writeFile(thumbPath, thumb);
      generatedCount++;
    }

    // Generate 1400px lightbox preview
    if (!fs.existsSync(previewPath)) {
      const preview = await sharp(sourceBuffer)
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 75, effort: 3 })
        .toBuffer();
      await fs.promises.writeFile(previewPath, preview);
      generatedCount++;
    }

    const sharpTime = Date.now() - startSharp;
    console.log(
      `${tag} 🎨 Optimized & cached WebP (${generatedCount} size${generatedCount === 1 ? '' : 's'}) in ${sharpTime}ms: ${filename}`
    );

    return true;
  } catch (err: any) {
    console.error(`${tag} ❌ Failed caching ${filename}:`, err?.message || err);
    return false;
  }
}

/**
 * Reads fallback items from media-backup.json if database does not contain the albums.
 */
function getBackupAlbumItems(): Map<string, { id: string; title: string; images: string[]; url?: string }> {
  const map = new Map<string, { id: string; title: string; images: string[]; url?: string }>();
  try {
    const backupPath = path.join(process.cwd(), 'media-backup.json');
    if (fs.existsSync(backupPath)) {
      const raw = fs.readFileSync(backupPath, 'utf8');
      const parsed = JSON.parse(raw);
      const items = parsed?.data?.mediaItems || [];
      for (const item of items) {
        if (item.id) {
          map.set(item.id, {
            id: item.id,
            title: item.title || 'Untitled Album',
            images: Array.isArray(item.images) ? item.images : [],
            url: item.url,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[ALBUM CACHE] Could not read media-backup.json fallback:', err);
  }
  return map;
}

/**
 * Pre-caches images for a list of album IDs.
 * Queries the database first; falls back to media-backup.json if record is not in database.
 */
export async function cacheAlbumsByIds(albumIds: string[] = BACKUP_ALBUM_IDS) {
  console.log(`\n======================================================`);
  console.log(`[ALBUM CACHE] 🚀 Starting pre-cache process for ${albumIds.length} albums...`);

  // 1. Fetch from database
  let dbAlbums: any[] = [];
  try {
    dbAlbums = await prisma.mediaItem.findMany({
      where: { id: { in: albumIds } },
      select: {
        id: true,
        title: true,
        url: true,
        images: true,
      },
    });
  } catch (err) {
    console.warn('[ALBUM CACHE] Database fetch failed, will use media-backup.json:', err);
  }

  const dbMap = new Map(dbAlbums.map((a) => [a.id, a]));
  const backupMap = getBackupAlbumItems();

  const results = [];

  for (const id of albumIds) {
    const albumStartTime = Date.now();
    const album = dbMap.get(id) || backupMap.get(id);

    if (!album) {
      console.log(`[ALBUM CACHE] ⚠️ Album ID not found in database or media-backup.json: "${id}"`);
      continue;
    }

    const urls: string[] = [];
    if (Array.isArray(album.images) && album.images.length > 0) {
      urls.push(...album.images);
    } else if (album.url) {
      urls.push(...album.url.split(/[\n,]+/).map((u: string) => u.trim()).filter(Boolean));
    }

    console.log(`\n[ALBUM CACHE] 📁 Album: "${album.title}" (${urls.length} images) [ID: ${album.id}]`);

    if (urls.length === 0) {
      console.log(`[ALBUM CACHE] ⚠️ No image URLs found for album "${album.title}".`);
      results.push({
        albumId: album.id,
        title: album.title,
        totalImages: 0,
        cachedCount: 0,
        failedCount: 0,
      });
      continue;
    }

    let cachedCount = 0;
    let failedCount = 0;

    // Process in batches of 2 parallel downloads to optimize bandwidth and memory
    const CONCURRENCY = 2;
    for (let i = 0; i < urls.length; i += CONCURRENCY) {
      const batch = urls.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((url, batchIndex) => cacheSingleImage(url, i + batchIndex, urls.length, '[ALBUM CACHE]'))
      );
      batchResults.forEach((ok) => {
        if (ok) cachedCount++;
        else failedCount++;
      });
    }

    const albumDuration = ((Date.now() - albumStartTime) / 1000).toFixed(1);
    console.log(
      `[ALBUM CACHE] ✅ Finished "${album.title}": ${cachedCount}/${urls.length} cached successfully, ${failedCount} failed (${albumDuration}s)`
    );

    results.push({
      albumId: album.id,
      title: album.title,
      totalImages: urls.length,
      cachedCount,
      failedCount,
    });
  }

  console.log(`[ALBUM CACHE] 🎉 Pre-cache process finished for ${results.length} albums!`);
  console.log(`======================================================\n`);

  return results;
}

/**
 * Starts background album pre-cache worker on server boot.
 * Waits delayMs (default: 8s) to avoid competing with Next.js boot and initial requests.
 */
export function startAlbumPreCacheWorker(albumIds = BACKUP_ALBUM_IDS, delayMs = 8000): boolean {
  if (globalThis.__albumPreCacheWorkerStarted) {
    return false;
  }
  globalThis.__albumPreCacheWorkerStarted = true;

  console.log(`[ALBUM PRE-CACHE WORKER] Registered background worker (Startup delay: ${delayMs / 1000}s, Albums: ${albumIds.length})...`);

  const timer = setTimeout(async () => {
    try {
      console.log(`[ALBUM PRE-CACHE WORKER] 🚀 Server boot complete. Starting album pre-cache check...`);
      await cacheAlbumsByIds(albumIds);
    } catch (err: any) {
      console.error('[ALBUM PRE-CACHE WORKER] Background pre-cache encountered error:', err?.message || err);
    }
  }, delayMs);

  if (timer.unref) {
    timer.unref();
  }

  return true;
}
