import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { generateTokens, verifyRefreshToken } from '../services/tokenService';
import { sendPasswordResetEmail } from '../services/emailService';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email уже используется' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    await user.save();

    const tokens = generateTokens({ id: user._id, email: user.email, role: user.role });
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const tokens = generateTokens({ id: user._id, email: user.email, role: user.role });
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при входе' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token обязателен' });
    }
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (e) {
      return res.status(401).json({ message: 'Неверный refresh token' });
    }
    const tokens = generateTokens({ id: payload.id, email: payload.email, role: payload.role });
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления токена' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.json({ message: 'Успешный выход' });
};

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
}); 

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'Если пользователь с таким email существует, на него будет отправлен код восстановления.' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 3600000; // 1 час

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailSent) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Ошибка при отправке письма. Пожалуйста, попробуйте позже.' });
    }

    res.status(200).json({ message: 'Код восстановления отправлен на ваш email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Ошибка при запросе восстановления пароля.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Неверный или просроченный токен восстановления.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Пароль успешно сброшен.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Ошибка при сбросе пароля.' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Неверный код или истек срок действия.' });
    }

    // Вместо простого сообщения, отправляем токен сброса пароля
    res.status(200).json({ message: 'Код подтвержден успешно.', resetToken: user.resetPasswordToken });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Ошибка при проверке кода.' });
  }
}; 