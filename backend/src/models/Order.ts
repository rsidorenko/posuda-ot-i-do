import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  recipient: {
    lastName: string;
    firstName: string;
    middleName: string;
  };
  status: 'unconfirmed' | 'assembling' | 'ready' | 'issued' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  readyAt: Date | null;
}

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  recipient: {
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['unconfirmed', 'assembling', 'ready', 'issued', 'cancelled'],
    default: 'unconfirmed'
  },
  readyAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Order = mongoose.model<IOrder>('Order', orderSchema); 