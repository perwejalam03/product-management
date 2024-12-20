import nodemailer from 'nodemailer';
import logger from './logger';

const C = "Email Utility";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  const F = "sendVerificationEmail";
  try {
    logger.info(`[${C}], [${F}], Sending verification email to [${email}]`);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `,
    });

    logger.info(`[${C}], [${F}], Verification email sent successfully to [${email}]`);
    return true;
  } catch (error) {
    logger.error(`[${C}], [${F}], Failed to send email to [${email}], Error [${(error as Error).message}]`);
    return false;
  }
};

