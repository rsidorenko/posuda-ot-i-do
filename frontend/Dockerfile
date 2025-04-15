# Этап сборки
FROM node:22-alpine as builder

WORKDIR /app

# Настройка npm для использования альтернативного registry
RUN npm config set registry https://registry.npmmirror.com/

# Копирование только файлов package.json для лучшего кэширования слоев
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Этап production
FROM docker.io/library/nginx:1.25.3-alpine

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копирование собранного приложения
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 