const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/kitchenware').then(async () => {
  const password = await bcrypt.hash('admin123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@example.com' },
    { name: 'Admin', email: 'admin@example.com', password, role: 'admin' },
    { upsert: true, new: true }
  );
  console.log('Admin upserted');
  process.exit();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 