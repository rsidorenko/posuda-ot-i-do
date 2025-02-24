import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

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

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

// Пример асинхронного экшена
export const fetchOrders = createAsyncThunk<Order[]>(
  'orders/fetchOrders',
  async () => {
    const res = await api.get('/orders/my-orders');
    return res.data;
  }
);

export const createOrder = createAsyncThunk<any, any>(
  'orders/createOrder',
  async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  }
);

export const cancelOrder = createAsyncThunk<any, string>(
  'orders/cancelOrder',
  async (orderId) => {
    const res = await api.patch(`/orders/${orderId}/cancel`);
    return res.data;
  }
);

export const updateOrderStatus = createAsyncThunk<any, { orderId: string; status: string }>(
  'orders/updateOrderStatus',
  async ({ orderId, status }) => {
    const res = await api.patch(`/orders/${orderId}`, { status });
    return res.data;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки заказов';
      });
  },
});

export default orderSlice.reducer; 