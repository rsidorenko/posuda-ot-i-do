import { Request, Response, NextFunction } from 'express';

// Валидация данных при регистрации
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  // Проверка наличия всех обязательных полей
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  // Проверка длины пароля
  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
  }

  // Проверка формата email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Неверный формат email' });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Неверный формат email' });
  }

  next();
}; 