import 'dotenv/config';
import { sendMail } from '../apps/api/src/services/mail.service.js';

async function testGmail() {
  console.log('--- Prova de Connexió Gmail ---');
  console.log(`Usuari: ${process.env.SMTP_USER}`);
  console.log(`Host: ${process.env.SMTP_HOST}`);
  console.log(`Port: ${process.env.SMTP_PORT}`);
  
  const info = await sendMail({
    to: process.env.SMTP_USER || '', // T'ho envies a tu mateix
    subject: 'Prova de configuració Iter Ecosystem',
    text: 'Si estàs llegint això, la configuració del servidor de correu funciona correctament!',
    html: '<b>Si estàs llegint això, la configuració del servidor de correu funciona correctament!</b>'
  });

  if (info) {
    console.log('✅ Èxit! Correu enviat correctament.');
    console.log('ID del missatge:', info.messageId);
  } else {
    console.log('❌ Error: No s\'ha pogut enviar el correu. Revisa els logs de dalt.');
  }
}

testGmail();
