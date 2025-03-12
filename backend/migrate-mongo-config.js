// В этом файле вы можете настроить migrate-mongo

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = {
  mongodb: {
    // TODO Измените (или проверьте) URL для вашей MongoDB:
    url: process.env.MONGO_URI || 'mongodb://localhost:27017',

    // TODO Измените это на имя вашей базы данных:
    databaseName: 'posuda-ot-i-do',

    options: {
      // Удалены устаревшие опции useNewUrlParser и useUnifiedTopology
    }
  },

  // Директория миграций, может быть относительным или абсолютным путем. Изменяйте только при необходимости.
  migrationsDir: 'migrations',

  // Коллекция MongoDB, где хранятся примененные изменения. Изменяйте только при необходимости.
  changelogCollectionName: 'changelog',

  // Коллекция MongoDB, где будет создана блокировка.
  lockCollectionName: 'changelog_lock',

  // Значение в секундах для TTL индекса, который будет использоваться для блокировки. Значение 0 отключает функцию.
  lockTtl: 0,

  // Расширение файла для создания миграций и поиска в директории миграций
  migrationFileExtension: '.js',

  // Включить алгоритм создания контрольной суммы содержимого файла и использовать его при сравнении для определения,
  // должен ли файл быть запущен. Требует, чтобы скрипты были закодированы для многократного запуска.
  useFileHash: false,

  // Не меняйте это, если вы не знаете, что делаете
  moduleSystem: 'commonjs',
};

module.exports = config;
