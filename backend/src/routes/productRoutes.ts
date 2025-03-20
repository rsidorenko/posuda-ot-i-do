import express, { Request, Response } from 'express';
import { Product } from '../models/Product';
import { auth, adminAuth } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import type { NextFunction } from 'express';
import type { FileFilterCallback } from 'multer';
import fs from 'fs';
import imageSize from 'image-size';
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
 * products:
 *   get:
 *     tags: [Products]
 *     summary: Получить список всех продуктов
 *     description: Возвращает пагинированный список продуктов с возможностью фильтрации
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Минимальная цена
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Максимальная цена
 *     responses:
 *       200:
 *         description: Успешный ответ
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
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalProducts:
 *                   type: integer
 *                   example: 50
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * products/search:
 *   get:
 *     tags: [Products]
 *     summary: Поиск продуктов
 *     description: Поиск продуктов по названию и описанию
 *     parameters:
 *       - $ref: '#/components/parameters/searchQuery'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Результаты поиска
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
 *                 totalProducts:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * products/category/{categoryId}:
 *   get:
 *     tags: [Products]
 *     summary: Получить продукты по категории
 *     description: Возвращает список продуктов, принадлежащих указанной категории
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категории
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Список продуктов в категории
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
 *                 totalProducts:
 *                   type: integer
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/category/:categoryId', getProductsByCategory);

/**
 * @swagger
 * products/categories:
 *   get:
 *     tags: [Products]
 *     summary: Получить список всех категорий
 *     description: Возвращает список всех уникальных категорий товаров
 *     responses:
 *       200:
 *         description: Список категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "Кухонная утварь"
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Получить продукт по ID
 *     description: Возвращает детальную информацию о продукте
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Информация о продукте
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getProductById);

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { files: 4 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Только изображения!'));
  }
}) as any;

/**
 * @swagger
 * products:
 *   post:
 *     tags: [Products]
 *     summary: Создать новый продукт
 *     description: Создает новый продукт (только для администраторов)
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
 *                 example: "Кухонный нож"
 *               description:
 *                 type: string
 *                 example: "Острый кухонный нож из нержавеющей стали"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 1299.99
 *               category:
 *                 type: string
 *                 example: "Кухонная утварь"
 *               stock:
 *                 type: integer
 *                 example: 100
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Изображение продукта
 *             required:
 *               - name
 *               - price
 *               - category
 *     responses:
 *       201:
 *         description: Продукт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
router.post('/', auth, adminAuth, upload.single('image'), createProduct);

/**
 * @swagger
 * products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Обновить продукт
 *     description: Обновляет информацию о продукте (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID продукта
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
 *                 format: float
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Продукт успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
router.put('/:id', auth, adminAuth, upload.single('image'), updateProduct);

/**
 * @swagger
 * products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Удалить продукт
 *     description: Удаляет продукт (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Продукт успешно удален"
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
router.delete('/:id', auth, adminAuth, deleteProduct);

export default router; 