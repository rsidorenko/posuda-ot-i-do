#!/bin/bash

# Установка необходимых пакетов
sudo apt-get update
sudo apt-get install -y prometheus node-exporter

# Создание конфигурации Prometheus
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:5000']

  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:80']
EOF

# Создание docker-compose для мониторинга
cat > docker-compose.monitoring.yml << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    restart: always

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
    restart: always

volumes:
  grafana-storage:
EOF

# Запуск сервисов мониторинга
docker-compose -f docker-compose.monitoring.yml up -d

echo "Мониторинг настроен и запущен!"
echo "Grafana доступна по адресу: http://localhost:3000"
echo "Prometheus доступен по адресу: http://localhost:9090" 