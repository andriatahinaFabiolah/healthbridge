import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReminderEmail = async ({ to, patientName, message, type }) => {
  const subject = type === 'medication'
    ? '💊 Rappel médicament — HealthBridge'
    : '📅 Rappel consultation — HealthBridge';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #10b981; padding: 32px 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .header p { color: #d1fae5; margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px 40px; }
        .greeting { font-size: 16px; color: #1e293b; margin-bottom: 16px; }
        .message-box { background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
        .message-box p { color: #065f46; margin: 0; font-size: 15px; }
        .cta { text-align: center; margin: 28px 0; }
        .cta a { background: #10b981; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; }
        .footer { padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❤️ HealthBridge</h1>
          <p>Votre santé, simplifiée</p>
        </div>
        <div class="body">
          <p class="greeting">Bonjour <strong>${patientName}</strong>,</p>
          <p style="color: #475569; font-size: 14px;">Nous vous rappelons de ne pas oublier :</p>
          <div class="message-box">
            <p>${message}</p>
          </div>
          <p style="color: #475569; font-size: 14px;">Prenez soin de vous et suivez bien votre traitement.</p>
          <div class="cta">
            <a href="http://localhost:5173/login">Voir mon espace santé</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 HealthBridge — Tous droits réservés</p>
          <p style="margin-top: 4px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service configuré ✅');
  } catch (error) {
    console.error('Erreur email service ❌', error.message);
  }
};