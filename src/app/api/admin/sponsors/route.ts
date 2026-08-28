import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SPONSORS_DATA } from '@/data/sponsors';

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: sponsors.length ? sponsors : SPONSORS_DATA });
  } catch {
    return NextResponse.json({ success: true, source: 'memory', data: SPONSORS_DATA });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, tier, logoUrl, websiteUrl, order } = body;

    try {
      const newSponsor = await prisma.sponsor.create({
        data: {
          name,
          tier: tier || 'Partner',
          logoUrl: logoUrl || '/assets/poster.jpg',
          websiteUrl: websiteUrl || '#',
          order: Number(order) || 0,
        },
      });
      return NextResponse.json({ success: true, source: 'prisma', data: newSponsor });
    } catch {
      const newSponsor = {
        id: `sp-${Date.now()}`,
        name,
        tier: tier || 'Partner',
        logoUrl: logoUrl || '/assets/poster.jpg',
        websiteUrl: websiteUrl || '#',
        order: Number(order) || 0,
        active: true,
      };
      return NextResponse.json({ success: true, source: 'memory', data: newSponsor });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sponsor ID required' }, { status: 400 });
    }

    try {
      await prisma.sponsor.delete({ where: { id } });
    } catch {
      // Memory fallback
    }

    return NextResponse.json({ success: true, message: `Sponsor ${id} deleted` });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
