import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_MEMBERS } from '@/data/members';

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: members });
  } catch {
    return NextResponse.json({ success: true, source: 'static', data: INITIAL_MEMBERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, role, notes } = body;

    try {
      const newMember = await prisma.member.create({
        data: {
          fullName,
          email,
          phone,
          role: role || 'Volunteer',
          status: 'Active',
          notes: notes || null,
        },
      });
      return NextResponse.json({ success: true, source: 'prisma', data: newMember });
    } catch {
      const fallbackMember = {
        id: `MITRA-MEM-${Math.floor(5000 + Math.random() * 4000)}`,
        name: fullName,
        email,
        phone,
        tier: role || 'Volunteer',
        address: 'London, UK',
        profession: 'Volunteer Advocate',
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: 'Lifetime',
      };
      return NextResponse.json({ success: true, source: 'static', data: fallbackMember });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
