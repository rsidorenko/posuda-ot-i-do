#!/bin/bash

# Настройка файрвола
echo "Настройка файрвола..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Настройка fail2ban
echo "Установка и настройка fail2ban..."
sudo apt-get update
sudo apt-get install -y fail2ban

# Создание конфигурации fail2ban
sudo cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

# Перезапуск fail2ban
sudo systemctl restart fail2ban

# Настройка автоматических обновлений безопасности
echo "Настройка автоматических обновлений безопасности..."
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Создание скрипта для проверки безопасности
cat > security-check.sh << EOF
#!/bin/bash

echo "Проверка открытых портов..."
sudo netstat -tulpn

echo "Проверка активных сервисов..."
sudo systemctl list-units --type=service --state=running

echo "Проверка последних входов в систему..."
last

echo "Проверка неудачных попыток входа..."
sudo grep "Failed password" /var/log/auth.log

echo "Проверка использования диска..."
df -h

echo "Проверка использования памяти..."
free -h
EOF

chmod +x security-check.sh

echo "Настройка безопасности завершена!"
echo "Для проверки безопасности запустите: ./security-check.sh" 