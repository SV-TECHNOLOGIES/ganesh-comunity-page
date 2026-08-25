import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INITIAL_SPONSORS = [
  { id: 'sp-1', name: 'Biryanis and more!', tier: 'Presented By', logoUrl: '/assets/organizers-poster.jpg', websiteUrl: 'https://biryanisandmore.com', order: 1 },
  { id: 'sp-2', name: 'ELE Entertainments', tier: 'In Association With', logoUrl: '/assets/organizers-poster.jpg', websiteUrl: '#', order: 2 },
  { id: 'sp-3', name: 'MITRA UK', tier: 'Organizer', logoUrl: '/assets/poster-dark.jpeg', websiteUrl: '#', order: 3 },
  { id: 'sp-4', name: 'UK Telugu Association (UKTA)', tier: 'Platform Partner', logoUrl: '/assets/poster.jpg', websiteUrl: 'https://ukta.org.uk', order: 4 },
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
