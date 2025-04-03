import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Product } from '../models/Product';
import { searchProducts } from '../controllers/productController';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Мокаем модель Product
jest.mock('../models/Product');

describe('Product Search Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Очищаем все моки
    jest.clearAllMocks();

    // Настраиваем мок ответа
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson as any,
      status: mockStatus as any
    };

    // Настраиваем мок запроса
    mockRequest = {
      query: {}
    };
  });

  it('должен искать продукты по текстовому запросу', async () => {
    // Подготовка
    const mockProducts = [{
      _id: new mongoose.Types.ObjectId(),
      name: 'Керамическая кружка',
      description: 'Красивая кружка из керамики',
      price: 500,
      category: 'Посуда',
      images: ['cup1.jpg'],
      thumbnails: ['cup1_thumb.jpg'],
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    // @ts-ignore
    Product.find = jest.fn().mockResolvedValue(mockProducts);
    mockRequest.query = { query: 'кружка' };

    // Действие
    await searchProducts(mockRequest as Request, mockResponse as Response);

    // Проверка
    expect(Product.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: 'кружка', $options: 'i' } },
        { description: { $regex: 'кружка', $options: 'i' } }
      ]
    });
    expect(mockJson).toHaveBeenCalledWith(mockProducts);
  });

  it('должен фильтровать продукты по категории', async () => {
    // Подготовка
    const mockProducts = [{
      _id: new mongoose.Types.ObjectId(),
      name: 'Керамическая кружка',
      description: 'Красивая кружка из керамики',
      price: 500,
      category: 'Посуда',
      images: ['cup1.jpg'],
      thumbnails: ['cup1_thumb.jpg'],
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    // @ts-ignore
    Product.find = jest.fn().mockResolvedValue(mockProducts);
    mockRequest.query = { category: 'Посуда' };

    // Действие
    await searchProducts(mockRequest as Request, mockResponse as Response);

    // Проверка
    expect(Product.find).toHaveBeenCalledWith({ category: 'Посуда' });
    expect(mockJson).toHaveBeenCalledWith(mockProducts);
  });

  it('должен фильтровать продукты по диапазону цен', async () => {
    // Подготовка
    const mockProducts = [{
      _id: new mongoose.Types.ObjectId(),
      name: 'Керамическая кружка',
      description: 'Красивая кружка из керамики',
      price: 500,
      category: 'Посуда',
      images: ['cup1.jpg'],
      thumbnails: ['cup1_thumb.jpg'],
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    // @ts-ignore
    Product.find = jest.fn().mockResolvedValue(mockProducts);
    mockRequest.query = { minPrice: '400', maxPrice: '600' };

    // Действие
    await searchProducts(mockRequest as Request, mockResponse as Response);

    // Проверка
    expect(Product.find).toHaveBeenCalledWith({
      price: {
        $gte: 400,
        $lte: 600
      }
    });
    expect(mockJson).toHaveBeenCalledWith(mockProducts);
  });

  it('должен обрабатывать ошибки поиска', async () => {
    // Подготовка
    // @ts-ignore
    Product.find = jest.fn().mockRejectedValue(new Error('Ошибка базы данных'));
    mockRequest.query = { query: 'кружка' };

    // Действие
    await searchProducts(mockRequest as Request, mockResponse as Response);

    // Проверка
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Ошибка поиска товаров' });
  });
}); 