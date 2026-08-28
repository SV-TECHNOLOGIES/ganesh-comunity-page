import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

export const sendEmail = async (to: string, subject: string, html: string) => {
  // If SMTP is not properly configured, just log the email (useful for local dev before setting .env)
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com') {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body: \n${html}\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MITRA <noreply@mitra.org.uk>',
      to,
      subject,
      html,
      
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendOTP = async (to: string, code: string, type: 'REGISTER' | 'FORGOT_PASSWORD') => {
  let subject = '';
  let html = '';

  if (type === 'REGISTER') {
    subject = 'Your MITRA Registration OTP';
    html = `
      <div style="font-family: sans-serif; max-w-md; margin: 0 auto;">
        <h2 style="color: #7A1620;">Welcome to MITRA</h2>
        <p>Your One-Time Password for registration is:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f0f0f0; text-align: center; border-radius: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
  } else if (type === 'FORGOT_PASSWORD') {
    subject = 'MITRA Password Reset OTP';
    html = `
      <div style="font-family: sans-serif; max-w-md; margin: 0 auto;">
        <h2 style="color: #7A1620;">MITRA Password Reset</h2>
        <p>You requested a password reset. Your One-Time Password is:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f0f0f0; text-align: center; border-radius: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
  }

  return sendEmail(to, subject, html);
};

// ── Guest Welcome Email ───────────────────────────────────────────────────────

export const sendGuestWelcomeEmail = async (
  to: string,
  fullName: string,
  tempPassword: string
) => {
  const subject = '🙏 Welcome to MITRA UK — Your Account Details';
  const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mitra.org.uk'}/login`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0D0705; border-radius: 16px; overflow: hidden; border: 1px solid rgba(212,175,55,0.4);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #7A1620 0%, #9C1F2E 100%); padding: 32px 28px; text-align: center; border-bottom: 2px solid #D4AF37;">
        <div style="font-size: 28px; margin-bottom: 8px;">🕉️</div>
        <h1 style="color: #F4C542; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: 1px; text-transform: uppercase;">Welcome to MITRA UK</h1>
        <p style="color: #F7EFE1; font-size: 13px; margin: 8px 0 0; opacity: 0.85;">Mana Indian Telugu Roots Abroad — Serving Our Community</p>
      </div>

      <!-- Body -->
      <div style="padding: 28px;">
        <p style="color: #F7EFE1; font-size: 15px; margin: 0 0 16px;">
          Namaste <strong style="color: #F4C542;">${fullName}</strong>,
        </p>
        <p style="color: #C9B79C; font-size: 13px; line-height: 1.7; margin: 0 0 24px;">
          Your MITRA UK membership account has been created automatically so you can complete your donation or Pooja booking seamlessly. 🙏
        </p>

        <!-- Credentials Box -->
        <div style="background: #160B08; border: 1px solid rgba(212,175,55,0.35); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: 700; color: #F4C542; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">Your Login Credentials</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #C9B79C; font-size: 12px; padding: 6px 0; width: 40%;">Email Address:</td>
              <td style="color: #F7EFE1; font-size: 13px; font-weight: 600; font-family: monospace;">${to}</td>
            </tr>
            <tr>
              <td style="color: #C9B79C; font-size: 12px; padding: 6px 0;">Temporary Password:</td>
              <td style="color: #F4C542; font-size: 16px; font-weight: 900; font-family: monospace; letter-spacing: 2px;">${tempPassword}</td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #F4C542); color: #0D0705; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border-radius: 50px; text-decoration: none;">
            Login to MITRA Portal →
          </a>
        </div>

        <p style="color: #C9B79C; font-size: 12px; line-height: 1.7; margin: 0;">
          <strong style="color: #F4C542;">🔐 Security note:</strong> This is a one-time temporary password. Please change it after your first login via the <em>Forgot Password</em> link on the login page.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 18px 28px; border-top: 1px solid rgba(212,175,55,0.2); text-align: center;">
        <p style="color: #7D6A4F; font-size: 11px; margin: 0;">
          MITRA — Mana Indian Telugu Roots Abroad · <a href="https://mitra.org.uk" style="color: #D4AF37; text-decoration: none;">mitra.org.uk</a>
        </p>
        <p style="color: #7D6A4F; font-size: 11px; margin: 6px 0 0;">If you did not make this request, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, html);
};
