import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 404 });
    }

    // Verify OTP
    const validOtp = await prisma.oTP.findFirst({
      where: {
        email,
        type: 'FORGOT_PASSWORD',
        code: otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.member.update({
      where: { email },
      data: { passwordHash },
    });

    // Delete used OTP
    await prisma.oTP.deleteMany({
      where: { email, type: 'FORGOT_PASSWORD' },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: unknown) {
    console.error('Error resetting password:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
