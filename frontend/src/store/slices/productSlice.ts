import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  thumbnails?: string[];
  category: string;
  stock: number;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products');
      // Универсальная обработка ответа
      return Array.isArray(response.data) ? response.data : response.data.products;
    } catch (error) {
      return rejectWithValue('Ошибка загрузки товаров');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    updateStock: (state, action: PayloadAction<{ id: string; stock: number }>) => {
      const { id, stock } = action.payload;
      const product = state.products.find((p: any) => p._id === id);
      if (product) {
        product.stock = stock;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка загрузки товаров';
      });
  },
});

export default productsSlice.reducer;
export const { updateStock } = productsSlice.actions; 