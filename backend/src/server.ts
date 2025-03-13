import app from './app';
import mongoose from 'mongoose';
const dotenv = require('dotenv');
import cron from 'node-cron';
import { Order } from './models/Order';
import { Product } from './models/Product';

dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/posuda-ot-i-do';

const cancelReadyOrders = async () => {
  try {

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const readyOrders = await Order.find({
      status: 'ready',
      readyAt: { $lte: tenDaysAgo }
    }).populate('items.product');


    for (const order of readyOrders) {
      try {
        order.status = 'cancelled';
        await order.save();

        for (const item of order.items) {
          if (item.product && typeof item.product !== 'string' && item.product._id) {
             await Product.findByIdAndUpdate(item.product._id, {
              $inc: { stock: item.quantity }
            });
          } else {
          }
        }
      } catch (orderError) {
      }
    }

  } catch (error) {
    console.error('Error processing order cancellation:', error);
  }
};


cron.schedule('0 0 * * *', cancelReadyOrders, {
  timezone: "Etc/UTC"
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(DB_URI);
    app.listen(PORT, () => {
    });
  } catch (error: any) {
    console.error('Ошибка запуска сервера:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('uncaughtException', (err) => {
  console.error('Неперехваченное исключение:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение промиса:', promise, 'причина:', reason);
}); 