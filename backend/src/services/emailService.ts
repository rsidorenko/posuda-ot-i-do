import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Восстановление пароля - Посуда от и до',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #A64E00;">Восстановление пароля</h2>
        <p>Здравствуйте!</p>
        <p>Мы получили запрос на восстановление пароля для вашей учетной записи.</p>
        <p>Ваш код для восстановления пароля: <strong style="color: #015D65;">${resetToken}</strong></p>
        <p>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
        <p>С уважением,<br>Команда "Посуда от и до"</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}; 