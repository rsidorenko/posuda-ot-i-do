import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Product from '../Product';
import cartReducer from '../../../store/slices/cartSlice';

const mockProduct = {
  _id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  image: 'test-image.jpg',
  category: 'test-category',
  stock: 10,
};

const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
  });
};

describe('Product Component', () => {
  it('renders product information correctly', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('adds product to cart when Add to Cart button is clicked', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Check if quantity controls appear
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('increases quantity when + button is clicked', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    // First add to cart
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Then increase quantity
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('decreases quantity when - button is clicked', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    // First add to cart
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Increase quantity to 2
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);

    // Then decrease quantity
    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('removes product from cart when quantity reaches 0', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    // First add to cart
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Then decrease quantity to 0
    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);

    // Check if Add to Cart button reappears
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });
}); 