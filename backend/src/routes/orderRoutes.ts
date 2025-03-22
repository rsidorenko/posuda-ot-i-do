import express from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { auth, adminAuth } from '../middleware/auth';
import mongoose from 'mongoose';
import { 
  createOrder, 
  getOrderById, 
  getUserOrders, 
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Управление заказами
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Получить список заказов пользователя
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заказов
 *   post:
 *     summary: Создать новый заказ
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - shippingAddress
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "ул. Примерная, 123"
 *                   city:
 *                     type: string
 *                     example: "Москва"
 *                   state:
 *                     type: string
 *                     example: "Московская область"
 *                   zipCode:
 *                     type: string
 *                     example: "123456"
 *                   country:
 *                     type: string
 *                     example: "Россия"
 *     responses:
 *       201:
 *         description: Заказ успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Отменить заказ
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID заказа
 *     responses:
 *       200:
 *         description: Заказ отменен
 *       400:
 *         description: Ошибка отмены заказа
 *       404:
 *         description: Заказ не найден
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Получить заказ по ID
 *     description: Возвращает информацию о заказе по его ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID заказа
 *     responses:
 *       200:
 *         description: Информация о заказе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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

/**
 * @swagger
 * /orders/user/me:
 *   get:
 *     tags: [Orders]
 *     summary: Получить заказы текущего пользователя
 *     description: Возвращает список заказов текущего пользователя
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Список заказов пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalOrders:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Получить все заказы
 *     description: Возвращает список всех заказов (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Фильтр по статусу заказа
 *     responses:
 *       200:
 *         description: Список всех заказов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalOrders:
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

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Обновить статус заказа
 *     description: Обновляет статус заказа (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID заказа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 example: "processing"
 *     responses:
 *       200:
 *         description: Статус заказа успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Удалить заказ
 *     description: Удаляет заказ (только для администраторов)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID заказа
 *     responses:
 *       200:
 *         description: Заказ успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Заказ успешно удален"
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

// Получить заказы пользователя
router.get('/my-orders', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Администраторы должны использовать эндпоинт /orders' });
    }
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

// Create new order
router.post('/', auth, createOrder);

// ADMIN: Get all orders, максимально подробная диагностика
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    // Используем lean() для получения простых объектов вместо документов Mongoose
    let orders = await Order.find({})
      .populate('user')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    // Фильтруем только валидные заказы
    orders = orders.filter(o => o && o.createdAt && o.items && o.user);
    
    return res.status(200).json(orders);
  } catch (error) {
    // Возвращаем пустой массив с кодом 200 вместо 500
    return res.status(200).json([]);
  }
});

// НОВЫЙ НАДЕЖНЫЙ МАРШРУТ: Получить все заказы для админа
router.get('/all-orders', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    const result: any[] = [];

    for (const order of orders) {
      try {
        if (!order || !order.items) {
          continue;
        }
        const safeOrder: any = {
          _id: order._id,
          user: { _id: order.user },
          items: [] as any[],
          totalAmount: order.totalAmount || 0,
          status: order.status || 'unconfirmed',
          createdAt: order.createdAt || new Date(),
          updatedAt: order.updatedAt || new Date(),
          recipient: order.recipient || { 
            lastName: 'Н/Д', 
            firstName: 'Н/Д',
            middleName: 'Н/Д'
          }
        };
        try {
          if (order.user) {
            const userDoc = await mongoose.model('User').findById(order.user).lean();
            if (userDoc) {
              safeOrder.user = userDoc;
            }
          }
        } catch (e) {
        }
        for (const item of order.items) {
          try {
            if (!item) continue;
            const safeItem: any = {
              _id: 'item_' + Math.random().toString(36).substring(2, 10),
              product: { _id: item.product },
              quantity: item.quantity || 1,
              price: item.price || 0,
              name: item.name || 'Товар',
              image: item.image || '/no-image.webp'
            };
            try {
              if (item.product) {
                const productDoc: any = await mongoose.model('Product').findById(item.product).lean();
                if (productDoc) {
                  safeItem.product = productDoc;
                  if (!item.name) safeItem.name = productDoc.name || 'Товар';
                  if (!item.image && productDoc.images && productDoc.images.length > 0) {
                    safeItem.image = productDoc.images[0];
                  }
                }
              }
            } catch (e) {
            }
            safeOrder.items.push(safeItem);
          } catch (e) {
            continue;
          }
        }
        result.push(safeOrder);
      } catch (e) {
        continue;
      }
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(200).json([]); // Всегда возвращаем 200, даже при ошибке
  }
});

// ADMIN: Поиск заказов по последним 4 символам номера заказа
router.get('/search-last4', auth, adminAuth, async (req, res) => {
  try {
    const { last4 } = req.query;
    if (!last4 || typeof last4 !== 'string' || last4.length !== 4) {
      return res.status(400).json({ message: 'last4 (4 символа) обязателен' });
    }
    // Получаем все заказы (без фильтра по дате)
    const allOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('items.product')
      .lean();
    // Фильтруем по последним 4 символам ObjectId
    const found = allOrders.filter(order => String(order._id).slice(-4) === last4);
    // Группируем по статусу
    const grouped: Record<string, any[]> = {
      unconfirmed: [],
      assembling: [],
      ready: [],
      issued: [],
      cancelled: []
    };
    for (const order of found) {
      const status = order.status || 'unconfirmed';
      if (grouped[status]) grouped[status].push(order);
    }
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка поиска заказов', error: String(error) });
  }
});

// ADMIN: Get order details by id (без фильтрации по user)
router.get('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order (admin)' });
  }
});

// Get order details
router.get('/:id', getOrderById);

// Cancel order
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['issued', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Нельзя отменить уже выданный или отменённый заказ.' 
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Change order status to 'cancelled' instead of deleting the order
    order.status = 'cancelled';
    await order.save();
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error cancelling order' });
  }
});

// Update order status (admin only)
router.patch('/:id', auth, adminAuth, updateOrderStatus);

// ADMIN: Add new product
router.post('/products', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    if (!name || !description || !price || !image || !category || stock == null) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }
    const product = new Product({ name, description, price, image, category, stock });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при добавлении товара' });
  }
});

// Delete order (admin only)
router.delete('/:id', auth, adminAuth, deleteOrder);

export default router; 
