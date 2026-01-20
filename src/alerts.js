import nodemailer from 'nodemailer';
import axios from 'axios';

// Email transporter (using SMTP)
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  console.log('📧 Email alerts configured');
} else {
  console.log('⚠️  Email alerts not configured (missing SMTP settings)');
}

export async function sendAlert({ type, to, url, subject, message, data }) {
  try {
    if (type === 'email' && transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text: message,
        html: `<pre>${message}</pre>`
      });

      console.log(`📧 Email alert sent to ${to}`);
      return { success: true };
    }

    if (type === 'webhook' && url) {
      await axios.post(url, data, {
        timeout: 10000,
        headers: {
          'User-Agent': 'HookCatch-Monitor/1.0',
          'Content-Type': 'application/json'
        }
      });

      console.log(`🔔 Webhook alert sent to ${url}`);
      return { success: true };
    }

    return { success: false, error: 'Alert type not configured' };
  } catch (error) {
    console.error('Error sending alert:', error.message);
    return { success: false, error: error.message };
  }
}
