import express, { Request, Response } from 'express';
import { Product } from '../models/Product';
import { auth, adminAuth } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import type { NextFunction } from 'express';
import type { FileFilterCallback } from 'multer';
import fs from 'fs';
import sharp from 'sharp';
import { imageSize } from 'image-size';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts,
  getProductsByCategory
} from '../controllers/productController';

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Получить список всех продуктов
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество продуктов на странице
 *     responses:
 *       200:
 *         description: Список продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     tags: [Products]
 *     summary: Поиск продуктов
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Поисковый запрос
 *     responses:
 *       200:
 *         description: Результаты поиска
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     tags: [Products]
 *     summary: Получить продукты по категории
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категории
 *     responses:
 *       200:
 *         description: Список продуктов в категории
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/category/:categoryId', getProductsByCategory);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     tags: [Products]
 *     summary: Получить список всех уникальных категорий товаров
 *     responses:
 *       200:
 *         description: Список уникальных категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');

    const categoryNames = categories.filter(cat => cat && cat.trim() !== '').sort();

    res.json(categoryNames);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Ошибка при получении категорий из БД' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Получить продукт по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Информация о продукте
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 */
router.get('/:id', getProductById);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: { files: 4 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Только изображения!'));
  }
}) as any; // Временное решение для типов multer

// Удаляю все старые роуты создания товара и оставляю только один простой
router.post('/', auth, adminAuth, upload.single('image'), createProduct);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Создать новый продукт (только для админа)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *               imageFit:
 *                 type: string
 *                 description: CSS object-fit value (e.g., cover, contain, fill)
 *                 enum:
 *                   - fill
 *                   - contain
 *                   - cover
 *                   - none
 *                   - scale-down
 *     responses:
 *       201:
 *         description: Продукт создан
 *       400:
 *         description: Неправильный запрос
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Обновить продукт
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               imageFit:
 *                 type: string
 *                 description: CSS object-fit value (e.g., cover, contain, fill)
 *                 enum:
 *                   - fill
 *                   - contain
 *                   - cover
 *                   - none
 *                   - scale-down
 *     responses:
 *       200:
 *         description: Продукт обновлен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 *       404:
 *         description: Продукт не найден
 */
router.put('/:id', auth, adminAuth as any, upload.single('image'), updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Удалить продукт
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Продукт удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 *       404:
 *         description: Продукт не найден
 */
router.delete('/:id', auth, adminAuth as any, deleteProduct);

// Глобальный обработчик ошибок для Multer/Sharp
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('!!! MULTER/SHARP ERROR:', err);
  res.status(500).json({ message: 'Ошибка загрузки файла', error: String(err) });
});

export default router; 