import express from 'express';
import { User } from '../models/User';
import { auth, adminAuth } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getCurrentUser
} from '../controllers/userController';

const router = express.Router();

router.get('/me', auth, getCurrentUser);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех пользователей (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, adminAuth, getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о пользователе по его ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', auth, adminAuth, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Обновить информацию о пользователе
 *     description: Обновляет информацию о пользователе (только для администраторов или самого пользователя)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Иван Иванов"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', auth, updateUser);

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     tags: [Users]
 *     summary: Обновить роль пользователя
 *     description: Обновляет роль пользователя (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Роль пользователя успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/role', auth, adminAuth, updateUserRole);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Удалить пользователя
 *     description: Удаляет пользователя (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Пользователь успешно удален"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', auth, adminAuth, deleteUser);

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d'
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d'
    });

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ message: 'Error logging in' });
  }
});

// Logout user (clear cookie and session)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // временно для localhost
    sameSite: 'lax',
    path: '/',
  });
  res.clearCookie('connect.sid', {
    httpOnly: true,
    secure: false, // временно для localhost
    sameSite: 'lax',
    path: '/',
  });
  if (typeof (req as any).logout === 'function') {
    (req as any).logout(() => {
      if (req.session) req.session.destroy(() => {});
      res.json({ message: 'Logged out' });
    });
    return;
  }
  if (req.session) req.session.destroy(() => {});
  res.json({ message: 'Logged out' });
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Update user name
router.patch('/update-name', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    // Check if user has changed name twice today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.nameChangeCount >= 2 && user.lastNameChange >= today) {
      return res.status(400).json({ message: 'Лимит изменения имени достигнут(2 раза в день)' });
    }

    user.name = name;
    user.nameChangeCount = user.lastNameChange >= today ? user.nameChangeCount + 1 : 1;
    user.lastNameChange = new Date();
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка обновления имени' });
  }
});

// Change password
router.patch('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Текущий пароль неверный' });
    }

    // Хешируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обновляем пароль напрямую в базе
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error changing password' });
  }
});

// Get current user


export default router; 