const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await User.findOneAndUpdate(
        { email: process.env.ADMIN_EMAIL },
        { 
          name: process.env.ADMIN_NAME,
          email: process.env.ADMIN_EMAIL,
          password,
          role: 'admin'
        },
        { upsert: true, new: true }
      );
      console.log('Admin user created/updated successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error creating/updating admin:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 