import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { register, login, logout, googleAuth, forgotPassword } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Неверные данные
 *       409:
 *         description: Email уже используется
 */
router.post('/register', validateRegistration, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход в систему
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Выход из системы
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 *       401:
 *         description: Не авторизован
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Аутентификация через Google
 *     responses:
 *       302:
 *         description: Перенаправление на Google OAuth
 */
router.get('/google', googleAuth);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login` }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google-success`);
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Запрос на сброс пароля (отправка кода на email)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Код для сброса пароля отправлен на email
 *       400:
 *         description: Неверный email или ошибка отправки письма
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Сброс пароля с использованием токена
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Пароль успешно сброшен
 *       400:
 *         description: Неверный или просроченный токен, или ошибка сброса пароля
 */
router.post('/reset-password', require('../controllers/authController').resetPassword);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Обновить access token по refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новые access и refresh токены
 *       400:
 *         description: Refresh token обязателен
 *       401:
 *         description: Неверный refresh token
 */
router.post('/refresh', require('../controllers/authController').refresh);

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     tags: [Auth]
 *     summary: Проверка кода восстановления пароля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 6-значный код восстановления
 *     responses:
 *       200:
 *         description: Код подтвержден успешно
 *       400:
 *         description: Неверный код или истек срок действия
 *       500:
 *         description: Ошибка сервера при проверке кода
 */
router.post('/verify-reset-code', require('../controllers/authController').verifyResetCode);

export default router; 