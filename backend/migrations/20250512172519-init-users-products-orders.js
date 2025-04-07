module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    // Индекс email для users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // Индекс name для products
    await db.collection('products').createIndex({ name: 1 });
    // Индекс user для orders
    await db.collection('orders').createIndex({ user: 1 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('users').dropIndex('email_1');
    await db.collection('products').dropIndex('name_1');
    await db.collection('orders').dropIndex('user_1');
  }
};
