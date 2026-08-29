import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, contactName, email, phone, tier, message } = body;

    if (!contactName || !email) {
      return NextResponse.json(
        { success: false, error: 'Contact name and email are required.' },
        { status: 400 }
      );
    }

    const recipient = process.env.SMTP_USER || 'contactus@mitrauk.com';
    const sponsorTier = tier || 'General Mahotsav Sponsorship';
    const companyName = company || 'Individual / Business Supporter';

    // 1. Email to MITRA Executive Team
    const adminHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF8F0; border-radius: 16px; overflow: hidden; border: 1px solid #E65C00;">
        <div style="background: linear-gradient(135deg, #E65C00 0%, #CC4000 100%); padding: 24px; text-align: center; color: #FFFFFF;">
          <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">🕉️ New Sponsor Lead Enquiry</h2>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">London Ganesh Mahotsav & MITRA UK</p>
        </div>
        <div style="padding: 24px; color: #3D1A00; font-size: 13px; line-height: 1.6;">
          <p style="font-size: 14px; font-weight: bold; margin-bottom: 16px;">
            A new sponsor enquiry has been submitted through the website:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid rgba(230,92,0,0.15);">
              <td style="padding: 8px 0; font-weight: bold; color: #6B3A2A; width: 40%;">Company / Sponsor:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #E65C00;">${companyName}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(230,92,0,0.15);">
              <td style="padding: 8px 0; font-weight: bold; color: #6B3A2A;">Contact Person:</td>
              <td style="padding: 8px 0; color: #3D1A00;">${contactName}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(230,92,0,0.15);">
              <td style="padding: 8px 0; font-weight: bold; color: #6B3A2A;">Email:</td>
              <td style="padding: 8px 0; color: #3D1A00;"><a href="mailto:${email}" style="color: #E65C00;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(230,92,0,0.15);">
              <td style="padding: 8px 0; font-weight: bold; color: #6B3A2A;">Phone / WhatsApp:</td>
              <td style="padding: 8px 0; color: #3D1A00;">${phone || 'Not provided'}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(230,92,0,0.15);">
              <td style="padding: 8px 0; font-weight: bold; color: #6B3A2A;">Sponsorship Interest:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #E65C00;">${sponsorTier}</td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #6B3A2A; vertical-align: top;">Message / Notes:</td>
              <td style="padding: 8px 0; color: #3D1A00;">${message}</td>
            </tr>
            ` : ''}
          </table>
          <p style="font-size: 11px; color: #6B3A2A; margin: 0;">
            This email was automatically generated from the MITRA UK Website sponsorship portal.
          </p>
        </div>
      </div>
    `;

    // Send email to team
    await sendEmail(recipient, `[Sponsor Lead] ${companyName} - ${contactName}`, adminHtml);

    // 2. Acknowledgment email to Sponsor
    const ackHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #FFF8F0; border-radius: 16px; overflow: hidden; border: 1px solid #E65C00;">
        <div style="background: linear-gradient(135deg, #E65C00 0%, #CC4000 100%); padding: 24px; text-align: center; color: #FFFFFF;">
          <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">🕉️ Thank You For Supporting MITRA UK</h2>
        </div>
        <div style="padding: 24px; color: #3D1A00; font-size: 13px; line-height: 1.6;">
          <p>Namaste <strong>${contactName}</strong>,</p>
          <p>Thank you for expressing interest in partnering with <strong>MITRA UK</strong> for the upcoming <strong>London Ganesh Mahotsav 2026</strong> at E Block, SLOUGH & LANGLEY COLLEGE.</p>
          <p>Our Sponsorship Coordination Team has received your inquiry for <strong>${sponsorTier}</strong> and will reach out to you shortly via email or phone with our official sponsorship deck.</p>
          <div style="background: #FFF0E0; border: 1px solid #E65C00; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #E65C00;">Direct Contact:</p>
            <p style="margin: 4px 0 0; color: #6B3A2A;">Email: <a href="mailto:contactus@mitrauk.com" style="color: #E65C00;">contactus@mitrauk.com</a> | Phone: +44 7404 530041</p>
          </div>
          <p style="margin: 0;">Warm regards,<br/><strong>MITRA UK Executive Committee</strong></p>
        </div>
      </div>
    `;

    await sendEmail(email, '🙏 MITRA UK — Sponsorship Inquiry Received', ackHtml);

    return NextResponse.json({
      success: true,
      message: 'Sponsorship inquiry email sent successfully.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send sponsorship enquiry';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
