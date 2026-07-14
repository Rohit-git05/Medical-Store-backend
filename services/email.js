const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Only attempt SMTP connection if host is set
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 2525,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const message = {
        from: `${process.env.SMTP_FROM || 'noreply@medicalstore.com'}`,
        to: options.email,
        subject: options.subject,
        html: options.htmlMessage
      };

      const info = await transporter.sendMail(message);
      console.log('Email sent: %s', info.messageId);
      return info;
    } else {
      console.log('--- EMAIL MOCK LOG ---');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body Snippet: ${options.htmlMessage.substring(0, 150)}...`);
      console.log('----------------------');
      return { mock: true, messageId: 'mock-id-' + Date.now() };
    }
  } catch (error) {
    console.error('Email Sending Error:', error);
    // Suppress error to avoid crashing flow in testing
    return { error: true, message: error.message };
  }
};

module.exports = sendEmail;
