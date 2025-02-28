import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { addToCart, updateQuantity, removeFromCart } from '../../../store/slices/cartSlice';
import { CatalogProductCard } from '../../products/ProductDetail';

// Конфигурация для React Router v6
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Мок для Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: (state = { items: [] }, action) => {
        switch (action.type) {
          case 'cart/addToCart':
            return { ...state, items: [...state.items, action.payload.product] };
          case 'cart/updateQuantity':
            return {
              ...state,
              items: state.items.map(item =>
                item._id === action.payload.id
                  ? { ...item, quantity: action.payload.quantity }
                  : item
              )
            };
          case 'cart/removeFromCart':
            return {
              ...state,
              items: state.items.filter(item => item._id !== action.payload)
            };
          default:
            return state;
        }
      }
    }
  });
};

describe('CatalogProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 100,
    description: 'Test Description',
    images: ['test-image.jpg'],
    category: 'test-category',
    stock: 10
  };

  const mockOnCardClick = jest.fn();

  const renderProductCard = (product = mockProduct) => {
    const store = createMockStore();
    return {
      ...render(
        <Provider store={store}>
          <BrowserRouter>
            <CatalogProductCard product={product} onCardClick={mockOnCardClick} />
          </BrowserRouter>
        </Provider>
      ),
      store
    };
  };

  it('renders product information correctly', () => {
    renderProductCard();

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`${mockProduct.price} ₽`)).toBeInTheDocument();
  });

  it('shows add to cart button when product is not in cart', () => {
    renderProductCard();

    const addButton = screen.getByText('В корзину');
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  it('shows quantity controls when product is in cart', async () => {
    const { store } = renderProductCard();
    
    // Добавляем товар в корзину
    await act(async () => {
      store.dispatch(addToCart({ 
        product: { ...mockProduct, quantity: 1, image: mockProduct.images[0] }, 
        quantity: 1 
      }));
    });

    // Проверяем наличие элементов управления количеством
    const quantityValue = screen.getByText('1');
    expect(quantityValue).toBeInTheDocument();
    
    const decreaseButton = screen.getByRole('button', { name: /уменьшить/i });
    const increaseButton = screen.getByRole('button', { name: /увеличить/i });
    expect(decreaseButton).toBeInTheDocument();
    expect(increaseButton).toBeInTheDocument();
  });

  it('shows out of stock message when product is not available', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderProductCard(outOfStockProduct);

    const addButton = screen.getByText('Нет в наличии');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });

  it('displays product image', () => {
    renderProductCard();

    const image = screen.getByRole('img', { name: mockProduct.name });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining(mockProduct.images[0]));
  });

  it('calls onCardClick when card is clicked', () => {
    renderProductCard();

    const card = screen.getByRole('img', { name: mockProduct.name }).closest('div');
    fireEvent.click(card!);

    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
  });

  it('handles add to cart action', async () => {
    const { store } = renderProductCard();

    const addButton = screen.getByText('В корзину');
    await act(async () => {
      fireEvent.click(addButton);
    });

    const state = store.getState();
    expect(state.cart.items).toHaveLength(1);
    expect(state.cart.items[0]._id).toBe(mockProduct._id);
  });

  it('handles quantity update actions', async () => {
    const { store } = renderProductCard();
    
    // Сначала добавляем товар в корзину
    await act(async () => {
      store.dispatch(addToCart({ 
        product: { ...mockProduct, quantity: 1, image: mockProduct.images[0] }, 
        quantity: 1 
      }));
    });

    // Увеличиваем количество
    const increaseButton = screen.getByRole('button', { name: /увеличить/i });
    await act(async () => {
      fireEvent.click(increaseButton);
    });

    let state = store.getState();
    expect(state.cart.items[0].quantity).toBe(2);

    // Уменьшаем количество
    const decreaseButton = screen.getByRole('button', { name: /уменьшить/i });
    await act(async () => {
      fireEvent.click(decreaseButton);
    });

    state = store.getState();
    expect(state.cart.items[0].quantity).toBe(1);
  });
}); 