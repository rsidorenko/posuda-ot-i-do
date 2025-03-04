import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Catalog from '../Catalog';
import cartReducer from '../../../store/slices/cartSlice';
import authReducer from '../../../store/slices/authSlice';
import productsReducer from '../../../store/slices/productSlice';
import api from '../../../store/api';

// Мок для window.scrollTo
window.scrollTo = jest.fn();

// Мок для API
jest.mock('../../../store/api', () => ({
  get: jest.fn()
}));

const mockCategories = ['кухонная', 'столовая'];
const mockProducts = [
  { _id: '1', name: 'Тарелка', price: 100, stock: 5, images: ['img1.jpg'], thumbnails: ['img1.jpg'], category: 'кухонная' },
  { _id: '2', name: 'Кружка', price: 200, stock: 0, images: ['img2.jpg'], thumbnails: ['img2.jpg'], category: 'столовая' }
];

const createMockStore = () => configureStore({
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

describe('Catalog Component', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
    
    // Настраиваем мок API
    (api.get as jest.Mock).mockImplementation((url, { params } = {}) => {
      if (url === '/products/categories') {
        return Promise.resolve({ data: mockCategories });
      }
      if (url === '/products/search') {
        let filtered = [...mockProducts];
        if (params?.query) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(params.query.toLowerCase()));
        }
        if (params?.category && params.category !== 'все') {
          filtered = filtered.filter(p => p.category === params.category);
        }
        return Promise.resolve({ data: filtered });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders products and allows search', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Catalog />
        </BrowserRouter>
      </Provider>
    );

    // Проверяем, что компонент загружается
    expect(screen.getByPlaceholderText('Поиск товаров...')).toBeInTheDocument();
    expect(screen.getByText('Стоимость')).toBeInTheDocument();

    // Ждем загрузки категорий
    await waitFor(() => {
      expect(screen.getByText('Кухонная')).toBeInTheDocument();
      expect(screen.getByText('Столовая')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Ждем загрузки товаров
    await waitFor(() => {
      expect(screen.getByText('Тарелка')).toBeInTheDocument();
      expect(screen.getByText('Кружка')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Поиск по названию
    const searchInput = screen.getByPlaceholderText('Поиск товаров...');
    fireEvent.change(searchInput, { target: { value: 'тарел' } });
    
    await waitFor(() => {
      expect(screen.getByText('Тарелка')).toBeInTheDocument();
      expect(screen.queryByText('Кружка')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('allows adding product to cart', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Catalog />
        </BrowserRouter>
      </Provider>
    );

    // Ждем загрузки товаров
    await waitFor(() => {
      expect(screen.getByText('Тарелка')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Находим кнопку "В корзину" для Тарелки, используя текст и родительский элемент
    const plateCardBeforeClick = screen.getByText('Тарелка').closest('.card') as HTMLElement;
    const addButton = within(plateCardBeforeClick).getByText('В корзину');
    
    fireEvent.click(addButton);

    // После клика проверяем наличие кнопок управления количеством и значения счетчика в карточке Тарелки
    // Ждем пока появится элемент счетчика количества с текстом '1' внутри карточки Тарелки
    await waitFor(() => {
      const plateTextElement = screen.getByText('Тарелка');
      const updatedPlateCard = plateTextElement.closest('.card') as HTMLElement;
      // Ждем, пока текст '1' появится внутри обновленной карточки
      expect(within(updatedPlateCard).getByText('1')).toBeInTheDocument();
    }, { timeout: 5000 }); 

    // Теперь, когда счетчик появился, проверяем кнопки управления количеством в той же карточке
    const plateTextElementAfterWait = screen.getByText('Тарелка');
    const plateCardAfterWait = plateTextElementAfterWait.closest('.card') as HTMLElement;
    const qtyButtons = within(plateCardAfterWait).getAllByRole('button', { class: 'qtyBtn' });
    expect(qtyButtons).toHaveLength(2); // Должно быть 2 кнопки: + и -

  });

  it('shows out of stock message for unavailable products', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Catalog />
        </BrowserRouter>
      </Provider>
    );

    // Ждем загрузки товаров
    await waitFor(() => {
      expect(screen.getByText('Кружка')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Проверяем сообщение о недоступности
    expect(screen.getByText('Нет в наличии')).toBeInTheDocument();
  });
}); 