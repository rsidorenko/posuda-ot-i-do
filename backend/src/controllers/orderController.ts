import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, recipient } = req.body;

    // Проверка на наличие товаров в заказе
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Заказ не может быть пустым. Добавьте товары.' });
    }

    if (!recipient || !recipient.lastName || !recipient.firstName || !recipient.middleName) {
      return res.status(400).json({ message: 'ФИО получателя обязательно' });
    }
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]
      });
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      recipient
    });

    await order.save();

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(400).json({ message: 'Ошибка создания заказа' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Формируем безопасный ответ для каждого товара
    const safeOrder = order.toObject();
    safeOrder.items = safeOrder.items.map((item: any) => {
      let name = item.name;
      let image = item.image;
      if (!item.product) {
        name = 'Товар отсутствует в продаже';
        image = '/no-image.webp';
      } else {
        if (!item.product.images || !item.product.images[0]) {
          image = '/no-image.webp';
        } else {
          image = item.product.images[0];
        }
        name = item.product.name || name;
      }
      return {
        ...item,
        name,
        image
      };
    });

    res.json(safeOrder);
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    res.status(500).json({ message: 'Ошибка получения заказа' });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    // Формируем безопасный ответ для каждого заказа и товара
    const safeOrders = orders.map(order => {
      const safeOrder = order.toObject();
      safeOrder.items = safeOrder.items.map((item: any) => {
        let name = item.name;
        let image = item.image;
        if (!item.product) {
          name = 'Товар отсутствует в продаже';
          image = '/no-image.webp';
        } else {
          if (!item.product.images || !item.product.images[0]) {
            image = '/no-image.webp';
          } else {
            image = item.product.images[0];
          }
          name = item.product.name || name;
        }
        return {
          ...item,
          name,
          image
        };
      });
      return safeOrder;
    });
    res.json(safeOrders);
  } catch (error) {
    console.error('Ошибка получения заказов пользователя:', error);
    res.status(500).json({ message: 'Ошибка получения заказов' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('user')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения всех заказов:', error);
    res.status(500).json({ message: 'Ошибка получения всех заказов' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
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
    // Set readyAt when status changes to 'ready'
    if (status === 'ready') {
      order.readyAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    res.status(400).json({ message: 'Ошибка обновления статуса заказа' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Ошибка удаления заказа:', error);
    res.status(500).json({ message: 'Ошибка удаления заказа' });
  }
}; 