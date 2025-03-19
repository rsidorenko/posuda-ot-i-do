import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { generateTokens, verifyRefreshToken } from '../services/tokenService';
import { sendPasswordResetEmail } from '../services/emailService';

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
  domain: '.posudaotido.ru',
  path: '/'
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
    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 час
      domain: '.posudaotido.ru',
      path: '/'
    });
    res.status(201).json({
      token: tokens.accessToken,
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
    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 час
      domain: '.posudaotido.ru',
      path: '/'
    });
    res.json({
      token: tokens.accessToken,
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
    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 час
      domain: '.posudaotido.ru',
      path: '/'
    });
    res.json({ token: tokens.accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления токена' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.posudaotido.ru',
    path: '/'
  });
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.posudaotido.ru',
    path: '/'
  });
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

    // Хешируем токен перед сохранением
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
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

    // Находим пользователя по хешированному токену и времени истечения
    const user = await User.findOne({
      resetPasswordToken: token, // Ищем по хешированному токену, пришедшему с фронтенда
      resetPasswordExpires: { $gt: Date.now() }
    });

    // Проверяем, найден ли пользователь
    if (!user) {
      return res.status(400).json({ message: 'Неверный или просроченный токен восстановления.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль и поля токена напрямую через findByIdAndUpdate, чтобы избежать повторного хеширования в хуке 'pre'
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    res.status(200).json({ message: 'Пароль успешно сброшен.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Ошибка при сбросе пароля.' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // Находим пользователя по email и времени истечения
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() }
    });

    // Проверяем, существует ли пользователь и совпадает ли хеш кода
    if (!user || !(await bcrypt.compare(code, user.resetPasswordToken || ''))) {
      return res.status(400).json({ message: 'Неверный код или истек срок действия.' });
    }

    // Вместо простого сообщения, отправляем токен сброса пароля (теперь это хеш)
    res.status(200).json({ message: 'Код подтвержден успешно.', resetToken: user.resetPasswordToken });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Ошибка при проверке кода.' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'педик' });
  }
};

// Google callback handler
export const googleCallback = (req: Request, res: Response, next: Function) => {
  passport.authenticate('google', { session: false }, async (err: any, user: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Ошибка аутентификации через Google' });
    }

    try {
      const tokens = generateTokens({ id: user._id, email: user.email, role: user.role });
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.cookie('token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000, // 1 час
        domain: '.posudaotido.ru',
        path: '/'
      });
      // Вместо res.redirect отправляем HTML с JS-редиректом
      res.send(`
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=https://posudaotido.ru/auth/google-success" />
            <script>window.location = 'https://posudaotido.ru/auth/google-success';</script>
          </head>
          <body>Redirecting...</body>
        </html>
      `);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при создании токенов' });
    }
  })(req, res, next);
};

// Refresh token handler
export const refreshToken = async (req: Request, res: Response) => {
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

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const tokens = generateTokens({ id: user._id, email: user.email, role: user.role });
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 час
      domain: '.posudaotido.ru',
      path: '/'
    });
    res.json({ token: tokens.accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления токена' });
  }
}; 