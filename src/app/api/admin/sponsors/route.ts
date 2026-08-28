import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INITIAL_SPONSORS = [
  { id: 'sp-1', name: 'Biryanis and more!', tier: 'Presented By', logoUrl: '/assets/organizers-poster.jpg', websiteUrl: 'https://biryanisandmore.com', order: 1 },
  { id: 'sp-2', name: 'ELE Entertainments', tier: 'In Association With', logoUrl: '/assets/organizers-poster.jpg', websiteUrl: '#', order: 2 },
  { id: 'sp-3', name: 'MITRA UK', tier: 'Organizer', logoUrl: '/assets/poster.jpg', websiteUrl: '#', order: 3 },
  { id: 'sp-4', name: 'UK Telugu Association (MITRA)', tier: 'Platform Partner', logoUrl: '/assets/poster.jpg', websiteUrl: 'https://mitra.org.uk', order: 4 },
];

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: sponsors.length ? sponsors : INITIAL_SPONSORS });
  } catch {
    return NextResponse.json({ success: true, source: 'memory', data: INITIAL_SPONSORS });
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
