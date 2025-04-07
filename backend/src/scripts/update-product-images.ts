import mongoose from 'mongoose';
import { Product } from '../models/Product';

async function updateImages() {
  await mongoose.connect('mongodb://localhost:27017/kitchenware');
  const products = await Product.find();
  for (const product of products) {
    let changed = false;
    const newImages = product.images.map((img: string) => {
      // Убираем query-параметры и меняем расширение на .webp
      const url = img.split('?')[0];
      if (url.match(/\.(jpg|jpeg|png)$/i)) {
        changed = true;
        return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
      return url;
    });
    if (changed) {
      product.images = newImages;
      await product.save();
    }
  }
  process.exit();
}

updateImages(); 