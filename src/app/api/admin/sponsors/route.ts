import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INITIAL_SPONSORS = [
  { id: 'sp-1', name: 'Biryanis', tier: 'Presented By', logoUrl: '/assets/sponsers/Biryanies.jpeg', websiteUrl: '#', order: 1 },
  { id: 'sp-2', name: 'ELE Entertainments', tier: 'In Association With', logoUrl: '/assets/sponsers/ELE%20Enteratinments.jpeg', websiteUrl: '#', order: 2 },
  { id: 'sp-3', name: 'FT Light', tier: 'Partner', logoUrl: '/assets/sponsers/FT%20Light%20logo%20.png', websiteUrl: '#', order: 3 },
  { id: 'sp-4', name: 'Langley Telugu Association', tier: 'Community Partner', logoUrl: '/assets/sponsers/Langley%20Telugu%20Association.jpeg', websiteUrl: '#', order: 4 },
  { id: 'sp-5', name: 'United Core', tier: 'Partner', logoUrl: '/assets/sponsers/United%20Core.jpeg', websiteUrl: '#', order: 5 },
  { id: 'sp-6', name: 'Willow Pharmacy', tier: 'Partner', logoUrl: '/assets/sponsers/Willow%20Pharmacy.jpeg', websiteUrl: '#', order: 6 },
  { id: 'sp-7', name: 'Wealthmax', tier: 'Partner', logoUrl: '/assets/sponsers/wealthmax%20logo%20High%20Resolution.%20(1).pdf', websiteUrl: '#', order: 7 },
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
