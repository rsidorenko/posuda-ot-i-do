# Kitchenware Backend

## Описание
Backend для интернет-магазина посуды. Реализованы REST API, документация Swagger, миграции, автоматические тесты, Docker.

---

## Быстрый старт

### 1. Клонирование и установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env` на основе `.env.example` и укажите:
```
MONGO_URI=mongodb://localhost:27017/kitchenware
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
NODE_ENV=development
```

### 3. Миграции БД
Для управления схемой БД используется migrate-mongo:
```bash
npx migrate-mongo up      # применить миграции
npx migrate-mongo down    # откатить миграции
```

### 4. Запуск сервера
```bash
npm run dev   # для разработки (ts-node + nodemon)
npm run build # сборка в dist/
npm start     # запуск из dist/
```

### 5. Документация API
Swagger UI доступен по адресу: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 6. Запуск тестов
```bash
npm test
```

### 7. Docker
Для запуска через Docker:
```bash
docker build -t kitchenware-backend .
docker-compose up
```

---

## Структура проекта
- `src/models` — схемы Mongoose
- `src/controllers` — контроллеры
- `src/routes` — роуты API
- `src/middleware` — middleware
- `src/__tests__` — автоматические тесты
- `migrations` — миграции для MongoDB

---

## Прочее
- Для миграций используется [migrate-mongo](https://github.com/seppevs/migrate-mongo)
- Для тестов — Jest + Supertest
- Для документации — Swagger (OpenAPI)
- Для контейнеризации — Docker, docker-compose

---

## Контакты
Вопросы — в issues или напрямую разработчику. 