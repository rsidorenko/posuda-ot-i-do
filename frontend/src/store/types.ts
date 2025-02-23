import { AuthState } from './slices/authSlice';
import { CartState } from './slices/cartSlice';
import { OrderState } from './slices/orderSlice';
import { Product } from './slices/productSlice';

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  cart: CartState;
  order: OrderState;
  products: ProductsState;
} 