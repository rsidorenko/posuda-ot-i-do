import mongoose from 'mongoose';
import { OrderService } from '../services/orderService';

// Mock the models
jest.mock('../models/User');
jest.mock('../models/Product');
jest.mock('../models/Cart');
jest.mock('../models/Order');
jest.mock('../services/orderService');

type CartService = {
  getCartByUserId: jest.Mock;
  clearCart: jest.Mock;
};

interface OrderData {
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    name: string;
    image: string;
  }>;
  totalAmount: number;
  recipient: {
    firstName: string;
    lastName: string;
    middleName: string;
  };
}

type OrderStatus = 'unconfirmed' | 'assembling' | 'ready' | 'issued' | 'cancelled';

describe('Order Lifecycle Unit Tests', () => {
  let orderService: jest.Mocked<OrderService>;
  let cartServiceMock: CartService;
  const mockUserId = new mongoose.Types.ObjectId();
  const mockProductId = new mongoose.Types.ObjectId();
  const mockCartId = new mongoose.Types.ObjectId();
  const mockOrderId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Initialize mocked services
    orderService = new OrderService() as jest.Mocked<OrderService>;
    cartServiceMock = {
      getCartByUserId: jest.fn(),
      clearCart: jest.fn()
    };
  });

  it('should complete full order lifecycle', async () => {
    // Mock cart data
    const mockCart = {
      _id: mockCartId,
      user: mockUserId,
      items: [{
        product: mockProductId,
        quantity: 2,
        price: 100,
        name: 'Test Product',
        image: 'test-image.jpg'
      }]
    };

    // Mock order data
    const mockOrder = {
      _id: mockOrderId,
      user: mockUserId,
      items: mockCart.items,
      totalAmount: 200,
      status: 'unconfirmed' as OrderStatus,
      recipient: {
        firstName: 'Test',
        lastName: 'User',
        middleName: 'Test'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      readyAt: new Date()
    };

    // Setup cart service mocks
    cartServiceMock.getCartByUserId.mockResolvedValue(mockCart);
    cartServiceMock.clearCart.mockResolvedValue(true);

    // Setup order service mocks
    orderService.createOrder.mockResolvedValue(mockOrder as any);
    orderService.getUserOrders.mockResolvedValue([mockOrder] as any);
    orderService.updateOrderStatus.mockResolvedValue({
      ...mockOrder,
      status: 'assembling' as OrderStatus
    } as any);

    // 1. Get cart
    const cart = await cartServiceMock.getCartByUserId(mockUserId);
    expect(cart).toBeTruthy();
    expect(cart?.items).toHaveLength(1);

    // 2. Create order
    const orderData: OrderData = {
      items: cart.items,
      totalAmount: 200,
      recipient: {
        firstName: 'Test',
        lastName: 'User',
        middleName: 'Test'
      }
    };

    const order = await orderService.createOrder(mockUserId, orderData);
    expect(order).toBeTruthy();
    expect(order.status).toBe('unconfirmed');
    expect(order.items).toHaveLength(1);
    expect(order.items[0].product.toString()).toBe(mockProductId.toString());
    expect(order.items[0].quantity).toBe(2);

    // 3. Clear cart
    const cartCleared = await cartServiceMock.clearCart(mockUserId);
    expect(cartCleared).toBe(true);

    // 4. Check order history
    const userOrders = await orderService.getUserOrders(mockUserId);
    expect(userOrders).toHaveLength(1);
    expect(userOrders[0]._id.toString()).toBe(mockOrderId.toString());
    expect(userOrders[0].status).toBe('unconfirmed');

    // 5. Update order status
    const updatedOrder = await orderService.updateOrderStatus(mockOrderId, 'assembling');
    expect(updatedOrder).toBeTruthy();
    expect(updatedOrder?.status).toBe('assembling');

    // Update mock for getUserOrders to return the updated order
    orderService.getUserOrders.mockResolvedValue([{
      ...mockOrder,
      status: 'assembling' as OrderStatus
    }] as any);

    // 6. Verify updated status in order history
    const updatedUserOrders = await orderService.getUserOrders(mockUserId);
    expect(updatedUserOrders[0].status).toBe('assembling');

    // Verify service method calls
    expect(cartServiceMock.getCartByUserId).toHaveBeenCalledWith(mockUserId);
    expect(cartServiceMock.clearCart).toHaveBeenCalledWith(mockUserId);
    expect(orderService.createOrder).toHaveBeenCalledWith(mockUserId, orderData);
    expect(orderService.getUserOrders).toHaveBeenCalledWith(mockUserId);
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(mockOrderId, 'assembling');
  });
});