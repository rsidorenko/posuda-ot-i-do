# Посуда от и до павпавпавпавп

## Описание проекта
Интернет-магазин посуды с каталогом товаров, корзиной, оформлением заказов, личным кабинетом и админ-панель.

## Технологический стек

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT аутентификация
- Google OAuth 2.0
- Swagger/OpenAPI документация
- Docker контейнеризация
- Nginx как reverse proxy
- Jest + Supertest для тестирования

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- Material-UI
- SCSS модули
- Docker

## Структура проекта

```
application/
├── backend/                    # Backend сервер
│   ├── src/
│   │   ├── __tests__/         # Тесты
│   │   │   ├── orders.test.ts # Тесты заказов
│   │   │   ├── products.test.ts # Тесты продуктов
│   │   │   └── users.test.ts  # Тесты пользователей
│   │   ├── config/            # Конфигурации
│   │   │   ├── passport.config.ts # Конфигурация Passport.js
│   │   │   └── google.config.ts   # Конфигурация Google OAuth
│   │   ├── controllers/       # Контроллеры API
│   │   │   ├── authController.ts  # Аутентификация
│   │   │   ├── orderController.ts # Управление заказами
│   │   │   ├── productController.ts # Управление товарами
│   │   │   └── userController.ts   # Управление пользователями
│   │   ├── middleware/        # Middleware функции
│   │   │   ├── auth.ts       # Аутентификация
│   │   │   └── validation.ts # Валидация данных
│   │   ├── models/           # Mongoose модели
│   │   │   ├── Order.ts      # Модель заказа
│   │   │   ├── Product.ts    # Модель продукта
│   │   │   └── User.ts       # Модель пользователя
│   │   ├── routes/           # API маршруты
│   │   │   ├── authRoutes.ts    # Маршруты аутентификации
│   │   │   ├── orderRoutes.ts   # Маршруты заказов
│   │   │   ├── productRoutes.ts # Маршруты продуктов
│   │   │   └── userRoutes.ts    # Маршруты пользователей
│   │   ├── services/         # Бизнес-логика
│   │   │   ├── emailService.ts  # Сервис отправки email
│   │   │   └── tokenService.ts  # Сервис работы с токенами
│   │   ├── app.ts            # Express приложение
│   │   ├── server.ts         # Точка входа сервера
│   │   └── swagger.ts        # Swagger конфигурация
│   ├── migrations/           # Миграции БД
│   ├── uploads/              # Загруженные файлы
│   ├── .env                 # Переменные окружения
│   ├── .env.test            # Тестовые переменные окружения
│   ├── createAdmin.js       # Скрипт создания админа
│   ├── Dockerfile           # Docker конфигурация
│   ├── docker-compose.yml   # Docker Compose конфигурация
│   ├── jest.config.js       # Jest конфигурация
│   ├── migrate-mongo-config.js # Конфигурация миграций
│   ├── package.json         # Зависимости
│   └── tsconfig.json        # TypeScript конфигурация
├── frontend/                # Frontend приложение
├── nginx/                   # Nginx конфигурация
├── ssl/                     # SSL сертификаты
├── .github/                 # GitHub Actions конфигурация
├── backup-docker-compose/   # Резервные копии Docker конфигураций
├── backup-frontend-nginx-conf/ # Резервные копии Nginx конфигураций
├── .env                     # Глобальные переменные окружения
├── .gitignore              # Git игнорируемые файлы
├── CI_CD_SETUP.md          # Инструкции по настройке CI/CD
├── DEPLOYMENT_CHECKLIST.md # Чек-лист деплоя
├── backup.sh               # Скрипт резервного копирования
├── deploy.sh               # Скрипт деплоя
├── docker-compose.yml      # Основной Docker Compose файл
├── monitoring.sh           # Скрипт мониторинга
├── package.json            # Корневые зависимости
└── security.sh             # Скрипт настройки безопасности
```

## Основные функции

### Пользовательская часть
- Регистрация и авторизация (email + Google OAuth)
- Просмотр каталога товаров
- Поиск и фильтрация товаров
- Корзина покупок
- Оформление заказов
- История заказов
- Личный кабинет

### Административная часть
- Управление товарами (CRUD)
- Управление заказами
- Управление пользователями
- Статистика продаж

## Установка и запуск

### Предварительные требования
- Docker и Docker Compose
- Node.js 18+
- MongoDB 6+

### Локальная разработка

1. Клонировать репозиторий:
```bash
git clone <repository-url>
cd application
```

2. Настроить переменные окружения:
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

3. Установить зависимости:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. Запустить в режиме разработки:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### Docker развертывание

1. Собрать и запустить контейнеры:
```bash
docker-compose up -d
```

2. Проверить статус:
```bash
docker-compose ps
```

## API Документация

Swagger UI доступен по адресу: `http://localhost:5000/api-docs`

## Тестирование

```bash
# Backend тесты
cd backend
npm test

# Frontend тесты
cd frontend
npm test
```

## Миграции базы данных

```bash
# Создать новую миграцию
npm run migrate:create

# Применить миграции
npm run migrate:up

# Откатить миграции
npm run migrate:down

# Статус миграций
npm run migrate:status
```

## Безопасность

- JWT аутентификация
- XSS защита
- SSL/TLS шифрование

## Мониторинг

- Prometheus метрики
- Winston логирование
- Health checks

## CI/CD

- GitHub Actions для автоматизации
- Автоматическое тестирование
- Автоматический деплой

## Скрипты

### Резервное копирование
```bash
./backup.sh
```

### Мониторинг
```bash
./monitoring.sh
```

### Деплой
```bash
./deploy.sh
```

### Безопасность
```bash
./security.sh
```

## Дополнительная документация

- [CI/CD настройка](CI_CD_SETUP.md)
- [Чек-лист деплоя](DEPLOYMENT_CHECKLIST.md)

## Лицензия

MIT

## Контакты

Для вопросов и предложений: [ваш-email@example.com]
