module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Создаем коллекции, если они не существуют
    const collections = ['users', 'products', 'orders'];
    for (const collection of collections) {
      const exists = await db.listCollections({ name: collection }).hasNext();
      if (!exists) {
        await db.createCollection(collection);
      }
    }

    // Создаем индексы
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ name: 1 });
    await db.collection('orders').createIndex({ user: 1 });
  },

  /**
   * @param db {import('mongodb').MongoClient}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Получаем информацию об индексах
    const collections = ['users', 'products', 'orders'];
    for (const collection of collections) {
      const indexes = await db.collection(collection).indexes();
      // Удаляем все индексы, кроме _id
      for (const index of indexes) {
        if (index.name !== '_id_') {
          await db.collection(collection).dropIndex(index.name);
        }
      }
    }
  }
};
