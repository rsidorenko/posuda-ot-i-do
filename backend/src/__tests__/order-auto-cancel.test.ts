import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Types
interface Order {
  id: string;
  status: OrderStatus;
  readyAt: Date | null;
  items: OrderItem[];
  totalAmount: number;
  userId: string;
  createdAt: Date;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled';

// Interfaces for our services
interface OrderRepository {
  findReadyOrders(): Promise<Order[]>;
  update(id: string, data: Partial<Order>): Promise<boolean>;
  findById(id: string): Promise<Order | null>;
}

interface NotificationService {
  notifyOrderCancelled(orderId: string, userId: string): Promise<void>;
}

// Mock implementations
const mockOrderRepository: jest.Mocked<OrderRepository> = {
  findReadyOrders: jest.fn(),
  update: jest.fn(),
  findById: jest.fn()
};

const mockNotificationService: jest.Mocked<NotificationService> = {
  notifyOrderCancelled: jest.fn()
};

// Service under test
class OrderAutoCancelService {
  private readonly READY_ORDER_EXPIRY_DAYS = 10;

  constructor(
    private orderRepository: OrderRepository = mockOrderRepository,
    private notificationService: NotificationService = mockNotificationService
  ) {}

  async cancelExpiredReadyOrders(): Promise<{ cancelled: number; failed: number }> {
    const readyOrders = await this.orderRepository.findReadyOrders();
    const now = new Date();
    let cancelled = 0;
    let failed = 0;

    for (const order of readyOrders) {
      if (!order.readyAt) continue;

      const daysSinceReady = Math.floor(
        (now.getTime() - order.readyAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceReady >= this.READY_ORDER_EXPIRY_DAYS) {
        try {
          const updated = await this.orderRepository.update(order.id, {
            status: 'Cancelled'
          });

          if (updated) {
            await this.notificationService.notifyOrderCancelled(order.id, order.userId);
            cancelled++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }
    }

    return { cancelled, failed };
  }

  // Вспомогательный метод для тестов
  async getOrderStatus(orderId: string): Promise<OrderStatus | null> {
    const order = await this.orderRepository.findById(orderId);
    return order?.status || null;
  }
}

describe('Order Auto Cancel Service Unit Tests', () => {
  let orderAutoCancelService: OrderAutoCancelService;
  const mockDate = new Date('2024-03-20T12:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
    orderAutoCancelService = new OrderAutoCancelService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('cancelExpiredReadyOrders', () => {
    it('should cancel orders that have been ready for more than 10 days', async () => {
      // Arrange
      const oldReadyDate = new Date('2024-03-09T12:00:00Z'); // 11 days ago
      const recentReadyDate = new Date('2024-03-18T12:00:00Z'); // 2 days ago

      const readyOrders: Order[] = [
        {
          id: 'order1',
          status: 'Ready',
          readyAt: oldReadyDate,
          items: [{ productId: 'prod1', quantity: 1, price: 100 }],
          totalAmount: 100,
          userId: 'user1',
          createdAt: new Date('2024-03-01T12:00:00Z')
        },
        {
          id: 'order2',
          status: 'Ready',
          readyAt: recentReadyDate,
          items: [{ productId: 'prod2', quantity: 2, price: 200 }],
          totalAmount: 400,
          userId: 'user2',
          createdAt: new Date('2024-03-15T12:00:00Z')
        }
      ];

      mockOrderRepository.findReadyOrders.mockResolvedValue(readyOrders);
      mockOrderRepository.update.mockResolvedValue(true);

      // Act
      const result = await orderAutoCancelService.cancelExpiredReadyOrders();

      // Assert
      expect(result.cancelled).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        'order1',
        { status: 'Cancelled' }
      );
      expect(mockNotificationService.notifyOrderCancelled).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.notifyOrderCancelled).toHaveBeenCalledWith(
        'order1',
        'user1'
      );
    });

    it('should not cancel orders that have been ready for less than 10 days', async () => {
      // Arrange
      const recentReadyDate = new Date('2024-03-18T12:00:00Z'); // 2 days ago
      const readyOrders: Order[] = [
        {
          id: 'order1',
          status: 'Ready',
          readyAt: recentReadyDate,
          items: [{ productId: 'prod1', quantity: 1, price: 100 }],
          totalAmount: 100,
          userId: 'user1',
          createdAt: new Date('2024-03-15T12:00:00Z')
        }
      ];

      mockOrderRepository.findReadyOrders.mockResolvedValue(readyOrders);

      // Act
      const result = await orderAutoCancelService.cancelExpiredReadyOrders();

      // Assert
      expect(result.cancelled).toBe(0);
      expect(result.failed).toBe(0);
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
      expect(mockNotificationService.notifyOrderCancelled).not.toHaveBeenCalled();
    });

    it('should handle orders without readyAt date', async () => {
      // Arrange
      const readyOrders: Order[] = [
        {
          id: 'order1',
          status: 'Ready',
          readyAt: null,
          items: [{ productId: 'prod1', quantity: 1, price: 100 }],
          totalAmount: 100,
          userId: 'user1',
          createdAt: new Date('2024-03-01T12:00:00Z')
        }
      ];

      mockOrderRepository.findReadyOrders.mockResolvedValue(readyOrders);

      // Act
      const result = await orderAutoCancelService.cancelExpiredReadyOrders();

      // Assert
      expect(result.cancelled).toBe(0);
      expect(result.failed).toBe(0);
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
      expect(mockNotificationService.notifyOrderCancelled).not.toHaveBeenCalled();
    });

    it('should handle failed updates and count them', async () => {
      // Arrange
      const oldReadyDate = new Date('2024-03-09T12:00:00Z'); // 11 days ago
      const readyOrders: Order[] = [
        {
          id: 'order1',
          status: 'Ready',
          readyAt: oldReadyDate,
          items: [{ productId: 'prod1', quantity: 1, price: 100 }],
          totalAmount: 100,
          userId: 'user1',
          createdAt: new Date('2024-03-01T12:00:00Z')
        }
      ];

      mockOrderRepository.findReadyOrders.mockResolvedValue(readyOrders);
      mockOrderRepository.update.mockResolvedValue(false);

      // Act
      const result = await orderAutoCancelService.cancelExpiredReadyOrders();

      // Assert
      expect(result.cancelled).toBe(0);
      expect(result.failed).toBe(1);
      expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.notifyOrderCancelled).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const oldReadyDate = new Date('2024-03-09T12:00:00Z');
      const readyOrders: Order[] = [
        {
          id: 'order1',
          status: 'Ready',
          readyAt: oldReadyDate,
          items: [{ productId: 'prod1', quantity: 1, price: 100 }],
          totalAmount: 100,
          userId: 'user1',
          createdAt: new Date('2024-03-01T12:00:00Z')
        }
      ];

      mockOrderRepository.findReadyOrders.mockResolvedValue(readyOrders);
      mockOrderRepository.update.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await orderAutoCancelService.cancelExpiredReadyOrders();

      // Assert
      expect(result.cancelled).toBe(0);
      expect(result.failed).toBe(1);
      expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.notifyOrderCancelled).not.toHaveBeenCalled();
    });
  });
}); 