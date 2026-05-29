import { sendEmail } from './utils/email.js';

async function test() {
  try {
    await sendEmail({
      to: 'nnamdihenry264@gmail.com',
      subject: 'Test Email',
      html: '<p>If you receive this, email works!</p>',
    });
    console.log('✅ Email sent successfully');
  } catch (err) {
    console.error('❌ Email failed:', err);
  }
}

test();