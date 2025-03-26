const mongoose = require('mongoose');
const Product = require('./src/models/Product.ts').Product;

async function updateImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kitchenware');
  const products = await Product.find();
    let updatedCount = 0;
    let errorCount = 0;
    
  for (const product of products) {
      try {
    let changed = false;
    const newImages = product.images.map(img => {
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
          updatedCount++;
        }
      } catch (productError) {
        errorCount++;
      }
    }
    
    if (errorCount > 0) {
      console.error(`Completed with ${errorCount} errors. Successfully updated ${updatedCount} products.`);
    } else {
      console.log(`Successfully updated ${updatedCount} products`);
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateImages(); 