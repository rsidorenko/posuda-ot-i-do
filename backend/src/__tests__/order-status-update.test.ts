import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Types
interface Order {
  id: string;
  status: OrderStatus;
  readyAt?: Date | null;
  items: OrderItem[];
  totalAmount: number;
  userId: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled';

// Interfaces for our services
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  update(id: string, data: Partial<Order>): Promise<boolean>;
}

// Mock implementation
const mockOrderRepository: jest.Mocked<OrderRepository> = {
  findById: jest.fn(),
  update: jest.fn()
};

// Service under test
class OrderService {
  constructor(
    private orderRepository: OrderRepository = mockOrderRepository
  ) {}

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const updateData: Partial<Order> = { status: newStatus };

    // Автоматически обновляем readyAt при изменении статуса на "Ready"
    if (newStatus === 'Ready' && order.status !== 'Ready') {
      updateData.readyAt = new Date();
    }

    const updated = await this.orderRepository.update(orderId, updateData);
    if (!updated) {
      throw new Error('Failed to update order');
    }

    // Возвращаем обновленный заказ
    const updatedOrder = await this.orderRepository.findById(orderId);
    if (!updatedOrder) {
      throw new Error('Failed to fetch updated order');
    }

    return updatedOrder;
  }
}

describe('Order Status Update Unit Tests', () => {
  let orderService: OrderService;
  const testOrder: Order = {
    id: 'order123',
    status: 'Processing',
    readyAt: null,
    items: [{
      productId: 'product123',
      quantity: 2,
      price: 100
    }],
    totalAmount: 200,
    userId: 'user123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService();

    // Setup default mock responses
    mockOrderRepository.findById.mockResolvedValue(testOrder);
    mockOrderRepository.update.mockResolvedValue(true);
  });

  describe('updateOrderStatus', () => {
    it('should update readyAt when status changes to Ready', async () => {
      // Arrange
      const updatedOrder: Order = {
        ...testOrder,
        status: 'Ready',
        readyAt: new Date('2024-03-20T12:00:00Z')
      };

      // Настраиваем моки для последовательных вызовов
      mockOrderRepository.findById
        .mockResolvedValueOnce(testOrder) // Первый вызов в updateOrderStatus
        .mockResolvedValueOnce(updatedOrder); // Второй вызов для получения обновленного заказа

      // Act
      const result = await orderService.updateOrderStatus(testOrder.id, 'Ready');

      // Assert
      expect(result.status).toBe('Ready');
      expect(result.readyAt).toBeInstanceOf(Date);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        testOrder.id,
        expect.objectContaining({
          status: 'Ready',
          readyAt: expect.any(Date)
        })
      );
    });

    it('should not update readyAt when status changes to other than Ready', async () => {
      // Arrange
      const updatedOrder: Order = {
        ...testOrder,
        status: 'Completed',
        readyAt: null
      };

      mockOrderRepository.findById
        .mockResolvedValueOnce(testOrder)
        .mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await orderService.updateOrderStatus(testOrder.id, 'Completed');

      // Assert
      expect(result.status).toBe('Completed');
      expect(result.readyAt).toBeNull();
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        testOrder.id,
        expect.objectContaining({
          status: 'Completed'
        })
      );
      // Проверяем, что readyAt не был включен в обновление
      expect(mockOrderRepository.update).not.toHaveBeenCalledWith(
        testOrder.id,
        expect.objectContaining({
          readyAt: expect.anything()
        })
      );
    });

    it('should not update readyAt when status is already Ready', async () => {
      // Arrange
      const readyOrder: Order = {
        ...testOrder,
        status: 'Ready',
        readyAt: new Date('2024-03-20T10:00:00Z')
      };

      const updatedOrder: Order = {
        ...readyOrder,
        status: 'Ready',
        readyAt: readyOrder.readyAt // Тот же самый readyAt
      };

      mockOrderRepository.findById
        .mockResolvedValueOnce(readyOrder)
        .mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await orderService.updateOrderStatus(readyOrder.id, 'Ready');

      // Assert
      expect(result.status).toBe('Ready');
      expect(result.readyAt).toEqual(readyOrder.readyAt); // readyAt не изменился
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        readyOrder.id,
        expect.objectContaining({
          status: 'Ready'
        })
      );
      // Проверяем, что readyAt не был включен в обновление
      expect(mockOrderRepository.update).not.toHaveBeenCalledWith(
        readyOrder.id,
        expect.objectContaining({
          readyAt: expect.anything()
        })
      );
    });

    it('should throw error if order not found', async () => {
      // Arrange
      mockOrderRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.updateOrderStatus('nonexistent-order', 'Ready'))
        .rejects.toThrow('Order not found');

      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if update fails', async () => {
      // Arrange
      mockOrderRepository.update.mockResolvedValue(false);

      // Act & Assert
      await expect(orderService.updateOrderStatus(testOrder.id, 'Ready'))
        .rejects.toThrow('Failed to update order');
    });
  });
}); 