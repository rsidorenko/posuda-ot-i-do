import { Request, Response } from 'express';
import { User } from '../models/User';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      totalPages,
      currentPage: page,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error){
    res.status(500).json({ message: 'Ошибка при получении пользователя' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;

    // Проверяем, имеет ли пользователь право на обновление
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Нет прав для обновления этого пользователя' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Обновляем только разрешенные поля
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении пользователя' });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Неверная роль пользователя' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении роли пользователя' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await user.deleteOne();
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
};

// Получить текущего пользователя
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }
    // req.user уже содержит объект пользователя (установлен в middleware)
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    console.error('Ошибка в getCurrentUser:', error);
    res.status(500).json({ message: 'Ошибка при получении текущего пользователя' });
  }
}; 