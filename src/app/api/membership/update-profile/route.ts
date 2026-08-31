import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, imageUrl, phone, profession, address } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const updated = await prisma.member.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        ...(imageUrl !== undefined && { imageUrl }),
        ...(phone !== undefined && { phone }),
        ...(profession !== undefined && { profession }),
        ...(address !== undefined && { address }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        phone: updated.phone,
        imageUrl: updated.imageUrl,
        tier: updated.tier,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
