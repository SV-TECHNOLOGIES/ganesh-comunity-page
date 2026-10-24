import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheAlbumsByIds, BACKUP_ALBUM_IDS } from '@/lib/album-cache-worker';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow background batch processing up to 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const albumId = body.albumId || body.id;

    if (!albumId) {
      return NextResponse.json({ success: false, error: 'albumId is required' }, { status: 400 });
    }

    let targetIds: string[] = [];
    if (albumId === 'all') {
      const allAlbums = await prisma.mediaItem.findMany({ select: { id: true } });
      targetIds = allAlbums.map((a) => a.id);
    } else if (albumId === 'backup') {
      targetIds = BACKUP_ALBUM_IDS;
    } else {
      targetIds = [albumId];
    }

    const results = await cacheAlbumsByIds(targetIds);

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
  const albumId = searchParams.get('albumId') || searchParams.get('id') || 'backup';

  const fakeReq = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ albumId }),
  });

  return POST(fakeReq);
}
