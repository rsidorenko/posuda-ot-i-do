import express from 'express';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '7d'
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false, // временно для localhost
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      })
      .status(201)
      .json({ user });
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '7d'
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false, // временно для localhost
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      })
      .json({ user });
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
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 