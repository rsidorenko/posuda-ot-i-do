import mongoose from 'mongoose';
import { config } from '../config';

// Подключаемся к тестовой базе данных перед всеми тестами
beforeAll(async () => {
  try {
    await mongoose.connect(config.mongodbUriTest);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
});

// Закрываем соединение после всех тестов
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
    throw error;
  }
});

// Очищаем все коллекции после каждого теста
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('Cleaned up test collections');
  } catch (error) {
    console.error('Error cleaning up test collections:', error);
    throw error;
  }
}); 