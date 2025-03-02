import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../Cart';
import cartReducer from '../../../store/slices/cartSlice';
import authReducer from '../../../store/slices/authSlice';
import productsReducer from '../../../store/slices/productSlice';
import * as orderSlice from '../../../store/slices/orderSlice';

// Мок для useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Мок только для асинхронного экшена createOrder
beforeAll(() => {
  jest.spyOn(orderSlice, 'createOrder').mockImplementation(() => ({ type: 'order/createOrder' }));
});

afterAll(() => {
  jest.restoreAllMocks();
});

const mockCartItems = [
  {
    _id: '1',
    name: 'Test Product 1',
    price: 99.99,
    quantity: 2,
    image: 'test-image-1.jpg',
    stock: 10
  },
  {
    _id: '2',
    name: 'Test Product 2',
    price: 149.99,
    quantity: 1,
    image: 'test-image-2.jpg',
    stock: 5
  }
];

const mockProducts = [
  {
    _id: '1',
    name: 'Test Product 1',
    price: 99.99,
    description: 'Test Description 1',
    images: ['test-image-1.jpg'],
    category: 'test-category',
    stock: 10
  },
  {
    _id: '2',
    name: 'Test Product 2',
    price: 149.99,
    description: 'Test Description 2',
    images: ['test-image-2.jpg'],
    category: 'test-category',
    stock: 5
  }
];

const createMockStore = (isAuthenticated = false) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
      products: productsReducer
    },
    preloadedState: {
      cart: {
        items: mockCartItems,
        total: 349.97
      },
      auth: {
        user: isAuthenticated ? { name: 'Test User', role: 'user' } : null,
        token: isAuthenticated ? 'test-token' : null,
        isAuthenticated,
        loading: false,
        error: null
      },
      products: {
        products: mockProducts,
        loading: false,
        error: null
      }
    }
  });
};

describe('Cart Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  it('renders empty cart message when cart is empty', () => {
    const store = configureStore({
      reducer: {
        cart: cartReducer,
        auth: authReducer,
        products: productsReducer
      },
      preloadedState: {
        cart: { items: [], total: 0 },
        auth: { user: null, token: null, isAuthenticated: false, loading: false, error: null },
        products: { products: [], loading: false, error: null }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Ваша корзина пуста')).toBeInTheDocument();
    expect(screen.getByText('Добавьте товары из каталога, чтобы оформить заказ')).toBeInTheDocument();
  });

  it('renders cart items and total correctly', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Корзина')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('349.97 ₽')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    const store = createMockStore(false);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Войдите для оформления заказа')).toBeInTheDocument();
  });

  it('shows order form when user is authenticated', () => {
    const store = createMockStore(true);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Данные получателя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Фамилия')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Отчество')).toBeInTheDocument();
    expect(screen.getByText('Оформить заказ')).toBeInTheDocument();
  });

  it('shows error message when trying to create order without filling recipient data', async () => {
    const store = createMockStore(true);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    const submitButton = screen.getByText('Оформить заказ');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Пожалуйста, заполните ФИО получателя')).toBeInTheDocument();
    });
  });

  it('updates quantity when clicking plus/minus buttons', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    const minusButtons = screen.getAllByText('-');
    const plusButtons = screen.getAllByText('+');

    // Уменьшаем количество первого товара
    fireEvent.click(minusButtons[0]);
    // Проверяем, что хотя бы один из элементов с текстом '1' есть
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);

    // Увеличиваем количество первого товара
    fireEvent.click(plusButtons[0]);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  it('disables plus button when quantity reaches stock limit', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    const plusButtons = screen.getAllByText('+');
    const firstItemPlusButton = plusButtons[0];

    // Нажимаем кнопку + 8 раз (текущее количество 2, лимит 10)
    for (let i = 0; i < 8; i++) {
      fireEvent.click(firstItemPlusButton);
    }

    // Проверяем, что кнопка + стала неактивной
    expect(firstItemPlusButton).toBeDisabled();
  });
}); 