import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Types
interface User {
  id: string;
  email: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface CartItem {
  product: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  recipient: {
    firstName: string;
    lastName: string;
    middleName: string;
  };
}

// Interfaces for our services
interface UserRepository {
  findById(id: string): Promise<User | null>;
}

interface ProductRepository {
  findById(id: string): Promise<Product | null>;
}

interface OrderRepository {
  create(order: Omit<Order, 'id'>): Promise<Order>;
  findByUserId(userId: string): Promise<Order[]>;
}

// Mock implementations
const mockUserRepository: jest.Mocked<UserRepository> = {
  findById: jest.fn()
};

const mockProductRepository: jest.Mocked<ProductRepository> = {
  findById: jest.fn()
};

const mockOrderRepository: jest.Mocked<OrderRepository> = {
  create: jest.fn(),
  findByUserId: jest.fn()
};

// Service under test
class CartService {
  constructor(
    private userRepository: UserRepository = mockUserRepository,
    private productRepository: ProductRepository = mockProductRepository,
    private orderRepository: OrderRepository = mockOrderRepository
  ) {}

  async createOrderFromCart(userId: string, cartItems: CartItem[], recipient: Order['recipient']): Promise<Order> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await this.orderRepository.create({
      userId,
      items: cartItems,
      totalAmount,
      recipient
    });

    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.orderRepository.findByUserId(userId);
  }
}

describe('Cart Service Unit Tests', () => {
  let cartService: CartService;
  const testUser: User = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const testProduct: Product = {
    id: 'product123',
    name: 'Test Product',
    price: 100,
    images: ['test.jpg']
  };

  const testCartItem: CartItem = {
    product: testProduct.id,
    quantity: 2,
    price: testProduct.price,
    name: testProduct.name,
    image: testProduct.images[0]
  };

  const testRecipient = {
    firstName: 'Test',
    lastName: 'User',
    middleName: 'Test'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cartService = new CartService();

    // Setup default mock responses
    mockUserRepository.findById.mockResolvedValue(testUser);
    mockProductRepository.findById.mockResolvedValue(testProduct);
  });

  describe('createOrderFromCart', () => {
    it('should create order from cart items', async () => {
      // Arrange
      const expectedOrder: Order = {
        id: 'order123',
        userId: testUser.id,
        items: [testCartItem],
        totalAmount: testCartItem.price * testCartItem.quantity,
        recipient: testRecipient
      };

      mockOrderRepository.create.mockResolvedValue(expectedOrder);

      // Act
      const order = await cartService.createOrderFromCart(
        testUser.id,
        [testCartItem],
        testRecipient
      );

      // Assert
      expect(order).toEqual(expectedOrder);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(testUser.id);
      expect(mockOrderRepository.create).toHaveBeenCalledWith({
        userId: testUser.id,
        items: [testCartItem],
        totalAmount: testCartItem.price * testCartItem.quantity,
        recipient: testRecipient
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.createOrderFromCart(
        'nonexistent-user',
        [testCartItem],
        testRecipient
      )).rejects.toThrow('User not found');

      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders', async () => {
      // Arrange
      const expectedOrders: Order[] = [{
        id: 'order123',
        userId: testUser.id,
        items: [testCartItem],
        totalAmount: testCartItem.price * testCartItem.quantity,
        recipient: testRecipient
      }];

      mockOrderRepository.findByUserId.mockResolvedValue(expectedOrders);

      // Act
      const orders = await cartService.getUserOrders(testUser.id);

      // Assert
      expect(orders).toEqual(expectedOrders);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(testUser.id);
      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(testUser.id);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(cartService.getUserOrders('nonexistent-user'))
        .rejects.toThrow('User not found');

      expect(mockOrderRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should return empty array if user has no orders', async () => {
      // Arrange
      mockOrderRepository.findByUserId.mockResolvedValue([]);

      // Act
      const orders = await cartService.getUserOrders(testUser.id);

      // Assert
      expect(orders).toEqual([]);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(testUser.id);
      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(testUser.id);
    });
  });
}); 