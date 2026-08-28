import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { department, name, email, message } = await request.json();

    if (!department || !name || !email || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const subject = `New Contact Form Submission: ${department}`;
    const html = `
      <div style="font-family: sans-serif; max-w-md; margin: 0 auto;">
        <h2 style="color: #7A1620;">New Message Received</h2>
        <p><strong>Department:</strong> ${department}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <div style="padding: 15px; background: #f0f0f0; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; font-size: 14px;">${message}</p>
        </div>
      </div>
    `;

    // Send the email to the organization's info address.
    const adminEmail = process.env.SMTP_FROM || 'info@ukta.org.uk';
    
    const emailSent = await sendEmail(adminEmail, subject, html);

    if (!emailSent) {
      return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (err: unknown) {
    console.error('Error sending contact message:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
