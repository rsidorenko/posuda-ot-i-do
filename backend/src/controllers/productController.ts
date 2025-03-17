import { Request, Response } from 'express';
import { Product } from '../models/Product';
import fs from 'fs';
import path from 'path';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      products,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения товаров' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения продукта' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock, imageFit } = req.body;
    const file = req.file;

    if (!name || !description || !price || !category || stock == null || !file) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Все поля и изображение обязательны' });
    }

    const imageUrl = '/uploads/' + file.filename;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images: [imageUrl],
      thumbnails: [imageUrl],
      imageFit: imageFit || 'cover'
    });

    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Ошибка создания товара:', error);
    res.status(500).json({ message: 'Ошибка при добавлении товара', details: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock, imageFit } = req.body;
    const file = req.file;

    // Получаем текущий товар для удаления старых изображений
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData: any = { name, description, price, category, stock };
    if (file) {
      const imageUrl = '/uploads/' + file.filename;
      updateData.images = [imageUrl];
      updateData.thumbnails = [imageUrl];

      // Удаляем старые изображения
      const oldImages = [...(currentProduct.images || []), ...(currentProduct.thumbnails || [])];
      for (const image of oldImages) {
        const imagePath = path.join(__dirname, '../../', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    if (imageFit !== undefined) {
      updateData.imageFit = imageFit;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка обновления товара' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Удаляем связанные изображения
    const imagesToDelete = [...(product.images || []), ...(product.thumbnails || [])];
    for (const image of imagesToDelete) {
      const imagePath = path.join(__dirname, '../../', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления продукта' });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query, category, minPrice, maxPrice } = req.query;
    const filter: any = {};

    if (query && typeof query === 'string' && query.trim() !== '') {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (category && typeof category === 'string' && category !== 'все') {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const products = await Product.find(filter);

    res.json(products);
  } catch (error: any) {
    console.error('Ошибка в контроллере searchProducts:', error);
    res.status(500).json({ message: 'Ошибка поиска товаров' });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ category: req.params.categoryId });
    res.json(products);
  } catch (error) {
    console.error('Ошибка получения товаров по категории:', error);
    res.status(500).json({ message: 'Ошибка получения товаров по категории' });
  }
}; 