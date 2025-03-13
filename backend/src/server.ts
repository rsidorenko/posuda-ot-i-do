import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { Order } from './models/Order';
import { Product } from './models/Product';

// Load environment variables
dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/posuda-ot-i-do';

// Function to cancel ready orders and restore stock
const cancelReadyOrders = async () => {
  try {
    // console.log('Running scheduled order cancellation job.');

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const readyOrders = await Order.find({
      status: 'ready',
      readyAt: { $lte: tenDaysAgo }
    }).populate('items.product');

    // console.log(`Found ${readyOrders.length} ready orders older than 10 days.`);

    for (const order of readyOrders) {
      try {
        // console.log(`Processing order ${order._id} for cancellation.`);
        order.status = 'cancelled';
        await order.save();
        // console.log(`Order ${order._id} status changed to cancelled.`);

        for (const item of order.items) {
          // console.log(`Processing item with product ID: ${item.product ? (typeof item.product !== 'string' ? item.product._id : item.product) : 'N/A'} for stock restoration.`);
          if (item.product && typeof item.product !== 'string' && item.product._id) {
             // console.log(`Attempting to restore stock for product ID: ${item.product._id} with quantity ${item.quantity}`);
             await Product.findByIdAndUpdate(item.product._id, {
              $inc: { stock: item.quantity }
            });
            // console.log(`Restored ${item.quantity} of product ${item.product._id} for order ${order._id}.`);
          } else {
            // console.warn(`Product not properly populated or product ID missing for item in order ${order._id}. Cannot restore stock. Item:`, item);
          }
        }
      } catch (orderError) {
        // console.error(`Error processing order ${order._id}:`, orderError);
      }
    }

  } catch (error) {
    console.error('Error processing order cancellation:', error);
  }
};

// Schedule the daily order cancellation job
// This cron expression runs the job every day at midnight (00:00)
cron.schedule('0 0 * * *', cancelReadyOrders, {
  timezone: "Etc/UTC" // Use UTC or specify your desired timezone
});

const PORT = process.env.PORT || 5000;
// const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb'; // Перенесено выше

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
  // process.exit(1); // Временно не выходим, чтобы увидеть другие логи
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение промиса:', promise, 'причина:', reason);
  // process.exit(1); // Временно не выходим
}); 