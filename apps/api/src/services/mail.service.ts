import nodemailer from 'nodemailer';

/**
 * Mail Service
 * Handles sending emails using SMTP configuration
 */

// Configure transporter from environment variables
// Note: In development, you can use a service like Mailtrap or Ethereal
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send a generic email
 */
export const sendMail = async (options: MailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"Iter Ecosystem" <no-reply@iter-ecosystem.com>',
      bcc: 'marticastanorodriguez@gmail.com',
      ...options,
    });
    console.log('[Mail] Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('[Mail] Error sending email:', error);
    // Don't throw, we don't want to break the app if mail fails
    return null;
  }
};

/**
 * Send a notification email to a user
 */
export const sendNotificationEmail = async (userEmail: string, userName: string, notification: { title: string, message: string }) => {
  const subject = `[Iter] Aviso: ${notification.title}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #004A99;">Hola ${userName},</h2>
      <p>Has recibido un nuevo aviso en el sistema Iter Ecosystem:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #004A99; margin: 20px 0;">
        <h3 style="margin-top: 0;">${notification.title}</h3>
        <p>${notification.message}</p>
      </div>
      <p>Puedes ver más detalles e interactuar con este aviso accediendo a la plataforma.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">
        Este es un mensaje automático. Por favor, no respondas a este correo.
      </p>
    </div>
  `;

  return sendMail({
    to: userEmail,
    subject,
    text: `${userName},\n\nNuevo aviso: ${notification.title}\n\n${notification.message}\n\nAccede a la plataforma para más detalles.`,
    html
  });
};
