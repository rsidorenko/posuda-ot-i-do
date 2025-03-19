import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  thumbnails: string[];
  category: string;
  stock: number;
  imageFit?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Цена не может быть отрицательной'],
    validate: {
      validator: function(value: number) {
        return value >= 0 && Number.isFinite(value);
      },
      message: 'Некорректная цена'
    }
  },
  images: {
    type: [String],
    required: true,
    validate: [(arr: string[]) => arr.length >= 1 && arr.length <= 4, 'Должно быть от 1 до 4 изображений']
  },
  thumbnails: {
    type: [String],
    required: true,
    validate: [(arr: string[]) => arr.length >= 1 && arr.length <= 4, 'Должно быть от 1 до 4 превью']
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Количество не может быть отрицательным'],
    default: 0,
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 0;
      },
      message: 'Количество должно быть целым неотрицательным числом'
    }
  },
  imageFit: {
    type: String,
    required: false,
    default: 'cover',
    enum: ['fill', 'contain', 'cover', 'none', 'scale-down']
  }
}, {
  timestamps: true
});

// Составной индекс для поиска по категории и цене
productSchema.index({ category: 1, price: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema); 