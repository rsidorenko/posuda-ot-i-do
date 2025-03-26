export const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kitchenware',
  mongodbUriTest: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kitchenware-test',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
}; 