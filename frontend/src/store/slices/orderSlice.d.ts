import { AsyncThunk } from '@reduxjs/toolkit';

export interface OrderItem {
  _id?: string;
  product: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export const createOrder: AsyncThunk<any, any, {}>;
export const fetchOrders: AsyncThunk<Order[], void, {}>;
export const cancelOrder: AsyncThunk<any, string, {}>;
export const updateOrderStatus: AsyncThunk<any, { orderId: string; status: string }, {}>; 