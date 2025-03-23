import { Order } from '../models/Order';
import mongoose from 'mongoose';

export class OrderService {
  async createOrder(userId: mongoose.Types.ObjectId, orderData: any) {
    const order = new Order({
      user: userId,
      ...orderData
    });
    return order.save();
  }

  async getUserOrders(userId: mongoose.Types.ObjectId) {
    return Order.find({ user: userId }).populate('items.product');
  }

  async updateOrderStatus(orderId: mongoose.Types.ObjectId, status: string) {
    return Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
  }
} 