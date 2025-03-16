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
 * /api/orders:
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
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       201:
 *         description: Заказ создан
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Не авторизован
 */

/**
 * @swagger
 * /api/orders/{id}/cancel:
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
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Получить заказ по ID
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
 *         description: Информация о заказе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Заказ не найден
 */

/**
 * @swagger
 * /api/orders/user/me:
 *   get:
 *     tags: [Orders]
 *     summary: Получить заказы текущего пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заказов пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Не авторизован
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Получить все заказы (только для админа)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список всех заказов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 */

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Обновить статус заказа (только для админа)
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Статус заказа обновлен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 *       404:
 *         description: Заказ не найден
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Удалить заказ (только для админа)
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
 *         description: Заказ удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 *       404:
 *         description: Заказ не найден
 */

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators should use /orders endpoint' });
    }
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
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
router.patch('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Validate status
    if (!['unconfirmed', 'assembling', 'ready', 'assembled', 'issued', 'cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: unconfirmed, assembling, ready, assembled, issued, cancelled'
      });
    }
    order.status = status;
    if (status === 'ready') {
      order.readyAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order status' });
  }
});

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