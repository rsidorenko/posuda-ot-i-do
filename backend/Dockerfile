FROM node:22-alpine

WORKDIR /app

# Настройка npm для использования альтернативного registry
RUN npm config set registry https://registry.npmmirror.com/

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Копируем только файлы package.json для установки зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm install

# Копируем исходный код
COPY . .

# Добавляем healthcheck endpoint в app.ts
RUN echo 'app.get("/health", (req, res) => { res.status(200).send("OK"); });' >> src/app.ts

# Собираем TypeScript
RUN npm run build

# Удаляем dev-зависимости после сборки
RUN npm prune --omit=dev

EXPOSE 5000

ENV NODE_ENV=production

# Используем node для запуска
CMD ["node", "dist/server.js"] 