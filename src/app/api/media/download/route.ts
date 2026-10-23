import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import JSZip from 'jszip';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_\-\. ]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50) || 'media_asset';
}

/**
 * Helper to fetch a file buffer either from local disk (if relative /assets or /uploads)
 * or via HTTP fetch if remote URL.
 */
async function fetchFileBuffer(url: string, origin: string): Promise<{ buffer: Buffer; ext: string } | null> {
  try {
    if (!url) return null;

    // Relative path on local filesystem
    if (url.startsWith('/')) {
      const localFilePath = path.join(process.cwd(), 'public', url);
      try {
        const fileData = await fs.readFile(localFilePath);
        const ext = path.extname(url).toLowerCase() || '.jpg';
        return { buffer: fileData, ext };
      } catch {
        // Fallback to HTTP fetch with origin
        const fullUrl = new URL(url, origin).toString();
        const res = await fetch(fullUrl, { cache: 'no-store' });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          const ext = path.extname(url).toLowerCase() || '.jpg';
          return { buffer: Buffer.from(ab), ext };
        }
      }
    }

    // Remote HTTP / HTTPS URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      const pathname = new URL(url).pathname;
      const ext = path.extname(pathname).toLowerCase() || '.jpg';
      return { buffer: Buffer.from(ab), ext };
    }

    return null;
  } catch (err) {
    console.error(`[MEDIA DOWNLOAD] Failed to load buffer for ${url}:`, err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. High-resolution media downloads are only available to logged-in members.',
          requiresLogin: true,
        },
        { status: 401 }
      );
    }

    const origin = new URL(request.url).origin;
    const body = await request.json().catch(() => ({}));
    const { eventId, mediaIds, mediaId } = body;

    // 2. Resolve media items to download
    let mediaItems: any[] = [];
    let eventTitle = 'MITRA_Community_Event';

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, title: true },
      });
      if (event) {
        eventTitle = event.title;
      }
      mediaItems = await prisma.mediaItem.findMany({
        where: {
          eventId,
          type: 'IMAGE',
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } else if (Array.isArray(mediaIds) && mediaIds.length > 0) {
      mediaItems = await prisma.mediaItem.findMany({
        where: {
          id: { in: mediaIds },
        },
        include: {
          event: { select: { title: true } },
        },
      });
      if (mediaItems[0]?.event?.title) {
        eventTitle = mediaItems[0].event.title;
      }
    } else if (mediaId) {
      const single = await prisma.mediaItem.findUnique({
        where: { id: mediaId },
        include: { event: { select: { title: true } } },
      });
      if (single) {
        mediaItems = [single];
        if (single.event?.title) eventTitle = single.event.title;
      }
    }

    // Filter out external album links or invalid URLs
    const downloadableItems = mediaItems.filter(
      (m) =>
        m.url &&
        !m.url.includes('photos.app.goo.gl') &&
        !m.url.includes('photos.google.com') &&
        !m.url.includes('drive.google.com') &&
        !m.url.includes('youtube.com') &&
        !m.url.includes('youtu.be')
    );

    if (downloadableItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No downloadable image files found for this request.' },
        { status: 404 }
      );
    }

    // 3. Log download activity in DB & SystemLog
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      const resolvedEventId = eventId || downloadableItems[0]?.eventId || 'evt-general';
      const resolvedMediaId = downloadableItems.length === 1 ? downloadableItems[0].id : (mediaId && mediaId !== 'ALL' ? mediaId : null);

      // Ensure Member record exists for user (e.g. if an Admin downloads)
      const memberExists = await prisma.member.findUnique({ where: { id: user.id }, select: { id: true } });
      if (!memberExists) {
        await prisma.member.create({
          data: {
            id: user.id,
            email: user.email,
            fullName: user.fullName || user.email.split('@')[0],
            phone: '0000000000',
            role: user.role || 'Member',
            tier: user.tier || 'Member',
          },
        });
      }

      await prisma.mediaDownloadLog.create({
        data: {
          userId: user.id,
          eventId: resolvedEventId,
          mediaId: resolvedMediaId,
          fileCount: downloadableItems.length,
          downloadType: downloadableItems.length > 1 ? (eventId ? 'ALBUM' : 'ZIP') : 'SINGLE',
          ip,
          userAgent,
        },
      });

      await logger.info(
        'media/download',
        `User "${user.fullName || user.email}" <${user.email}> downloaded ${downloadableItems.length} file(s) from "${eventTitle}" (${downloadableItems.length > 1 ? 'ZIP' : 'SINGLE'})`,
        {
          userId: user.id,
          userEmail: user.email,
          eventTitle,
          count: downloadableItems.length,
        }
      );
    } catch (logErr) {
      console.error('[MEDIA DOWNLOAD] Logging failed:', logErr);
    }

    // 4. Return single photo directly if only one photo (not a group) requested
    const single = downloadableItems.length === 1 && !eventId && (!mediaIds || mediaIds.length <= 1) ? downloadableItems[0] : null;
    const singleImages = single?.images && single.images.length > 0 ? single.images : (single ? [single.url] : []);

    if (single && singleImages.length === 1) {
      const fileData = await fetchFileBuffer(singleImages[0], origin);
      if (!fileData) {
        return NextResponse.json(
          { success: false, error: 'Could not fetch image file from storage.' },
          { status: 502 }
        );
      }
      const safeName = `${sanitizeFilename(single.title || 'photo')}${fileData.ext}`;
      const mimeType = fileData.ext === '.png' ? 'image/png' : fileData.ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return new NextResponse(new Uint8Array(fileData.buffer), {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${safeName}"`,
          'Content-Length': fileData.buffer.length.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // 5. Generate ZIP archive if multiple files, multi-image group, or full album requested
    const zip = new JSZip();
    let addedCount = 0;

    for (let i = 0; i < downloadableItems.length; i++) {
      const item = downloadableItems[i];
      const urls = item.images && item.images.length > 0 ? item.images : [item.url];
      for (let j = 0; j < urls.length; j++) {
        const u = urls[j];
        const fileData = await fetchFileBuffer(u, origin);
        if (fileData) {
          const itemNumber = (addedCount + 1).toString().padStart(2, '0');
          const cleanTitle = sanitizeFilename(item.title || 'photo');
          const suffix = urls.length > 1 ? `_${j + 1}` : '';
          const filename = `${itemNumber}_${cleanTitle}${suffix}${fileData.ext}`;
          zip.file(filename, fileData.buffer);
          addedCount++;
        }
      }
    }

    if (addedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not retrieve media assets from storage server.' },
        { status: 502 }
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const safeZipName = `MITRA_${sanitizeFilename(eventTitle)}_Photos.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeZipName}"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Media download failed';
    console.error('[MEDIA DOWNLOAD ERROR]:', err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

// Support GET for direct download link: /api/media/download?eventId=... or ?mediaId=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const mediaId = searchParams.get('mediaId');
  const mediaIdsParam = searchParams.get('mediaIds');
  const mediaIds = mediaIdsParam ? mediaIdsParam.split(',') : undefined;

  // Synthesize request for POST handler
  const fakeReq = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ eventId, mediaId, mediaIds }),
  });

  return POST(fakeReq);
}
