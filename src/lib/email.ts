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
      from: process.env.SMTP_FROM || 'UKTA <noreply@ukta.org.uk>',
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
    subject = 'Your UKTA Registration OTP';
    html = `
      <div style="font-family: sans-serif; max-w-md; margin: 0 auto;">
        <h2 style="color: #7A1620;">Welcome to UKTA</h2>
        <p>Your One-Time Password for registration is:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f0f0f0; text-align: center; border-radius: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
  } else if (type === 'FORGOT_PASSWORD') {
    subject = 'UKTA Password Reset OTP';
    html = `
      <div style="font-family: sans-serif; max-w-md; margin: 0 auto;">
        <h2 style="color: #7A1620;">UKTA Password Reset</h2>
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
