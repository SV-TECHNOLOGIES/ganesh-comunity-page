import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow long-running background batch processing

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

function downloadBuffer(url: string, timeoutMs = 180000, retries = 1): Promise<Buffer> {
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
          console.warn(`[CACHE-ALBUM] 🔄 Retrying download for ${fn} after error: ${err.message}`);
          downloadBuffer(url, timeoutMs, retries - 1).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
    req.on('error', (err) => {
      if (retries > 0) {
        const fn = url.split('/').pop()?.split('?')[0] || url;
        console.warn(`[CACHE-ALBUM] 🔄 Retrying download for ${fn} after error: ${err.message}`);
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

async function cacheSingleImage(rawUrl: string, index: number, total: number): Promise<boolean> {
  const filename = rawUrl.split('/').pop()?.split('?')[0] || rawUrl;
  const tag = `[CACHE-ALBUM] [${index + 1}/${total}]`;

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

    // If both thumbnail and preview are already cached, skip
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const albumId = body.albumId || body.id;

    if (!albumId) {
      return NextResponse.json({ success: false, error: 'albumId is required' }, { status: 400 });
    }

    console.log(`\n======================================================`);
    console.log(`[CACHE-ALBUM] 🚀 Starting album cache job for albumId: "${albumId}"`);

    const where = albumId === 'all' ? {} : { id: albumId };
    const albums = await prisma.mediaItem.findMany({
      where,
      select: {
        id: true,
        title: true,
        url: true,
        images: true,
      },
    });

    if (!albums.length) {
      console.log(`[CACHE-ALBUM] ⚠️ No albums found matching ID: "${albumId}"`);
      console.log(`======================================================\n`);
      return NextResponse.json({ success: false, error: 'Album not found' }, { status: 404 });
    }

    console.log(`[CACHE-ALBUM] Found ${albums.length} album(s) to process.`);
    const results = [];

    for (const album of albums) {
      const albumStartTime = Date.now();
      const urls: string[] = [];
      if (Array.isArray(album.images) && album.images.length > 0) {
        urls.push(...album.images);
      } else if (album.url) {
        urls.push(...album.url.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean));
      }

      console.log(
        `\n[CACHE-ALBUM] 📁 Album: "${album.title}" (${urls.length} images) [ID: ${album.id}]`
      );

      if (urls.length === 0) {
        console.log(`[CACHE-ALBUM] ⚠️ No image URLs found for this album.`);
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

      // Process in small parallel batches of 2 to balance bandwidth and memory
      const CONCURRENCY = 2;
      for (let i = 0; i < urls.length; i += CONCURRENCY) {
        const batch = urls.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(
          batch.map((url, batchIndex) => cacheSingleImage(url, i + batchIndex, urls.length))
        );
        batchResults.forEach((ok) => {
          if (ok) cachedCount++;
          else failedCount++;
        });
      }

      const albumDuration = ((Date.now() - albumStartTime) / 1000).toFixed(1);
      console.log(
        `[CACHE-ALBUM] ✅ Finished "${album.title}": ${cachedCount}/${urls.length} cached successfully, ${failedCount} failed (${albumDuration}s)`
      );

      results.push({
        albumId: album.id,
        title: album.title,
        totalImages: urls.length,
        cachedCount,
        failedCount,
      });
    }

    console.log(`[CACHE-ALBUM] 🎉 All albums processed!`);
    console.log(`======================================================\n`);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} album(s)`,
      data: results.length === 1 ? results[0] : results,
    });
  } catch (err: any) {
    console.error('[CACHE-ALBUM API ERROR]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to cache album' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('albumId') || searchParams.get('id') || 'all';

  const fakeReq = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ albumId }),
  });

  return POST(fakeReq);
}
