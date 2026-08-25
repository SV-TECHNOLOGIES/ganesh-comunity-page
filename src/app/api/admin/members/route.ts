import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: members });
  } catch {
    const members = DataStore.getMembers();
    return NextResponse.json({ success: true, source: 'datastore', data: members });
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
      const newMember = DataStore.addMember({
        name: fullName,
        email,
        phone,
        tier: role || 'Volunteer',
        address: 'London, UK',
        profession: 'Volunteer Advocate',
      });
      return NextResponse.json({ success: true, source: 'datastore', data: newMember });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
