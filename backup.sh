#!/bin/bash

# Настройки
BACKUP_DIR="/backups"
MONGODB_CONTAINER="mongo"
RETENTION_DAYS=7

# Создание директории для бэкапов если её нет
mkdir -p $BACKUP_DIR

# Получение текущей даты
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Создание бэкапа MongoDB
echo "Создание бэкапа MongoDB..."
docker exec $MONGODB_CONTAINER mongodump --out /dump
docker cp $MONGODB_CONTAINER:/dump $BACKUP_DIR/mongodb_$DATE

# Архивирование бэкапа
echo "Архивирование бэкапа..."
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz $BACKUP_DIR/mongodb_$DATE

# Удаление временных файлов
rm -rf $BACKUP_DIR/mongodb_$DATE

# Удаление старых бэкапов
echo "Удаление старых бэкапов..."
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Бэкап успешно создан: $BACKUP_DIR/mongodb_$DATE.tar.gz" 