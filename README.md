# Telegram User API для n8n

Проект для интеграции n8n с пользовательским API Telegram, позволяющий отправлять сообщения от имени вашего аккаунта (не бота).

## Требования

- VPS с Ubuntu
- Docker и Docker Compose
- Nginx
- Доменное имя с возможностью настройки поддоменов
- Аккаунт Telegram

## Шаги интеграции

### 1. Получение API_ID и API_HASH для Telegram

1. Перейдите на https://my.telegram.org/auth
2. Войдите в свой аккаунт Telegram
3. Выберите "API development tools"
4. Заполните форму (можно указать любое название приложения)
5. Сохраните полученные api_id и api_hash

### 2. Установка MTProto прокси для Telegram

```bash
# Создайте директорию для проекта
mkdir -p /opt/telegram-mtproxy
cd /opt/telegram-mtproxy

# Создайте файл .env с вашими учетными данными
cat > .env << 'EOF'
API_ID=ВАШ_API_ID
API_HASH=ВАШ_API_HASH
EOF

# Загрузите docker-compose.yml из этого репозитория
wget -O docker-compose.yml https://raw.githubusercontent.com/CreatmanCEO/telegram-user-api/main/docker-compose.yml

# Запустите контейнер
docker-compose up -d
```

### 3. Настройка Nginx

```bash
# Загрузите конфигурацию Nginx
wget -O /etc/nginx/sites-available/tg-api.itpovar.ru https://raw.githubusercontent.com/CreatmanCEO/telegram-user-api/main/nginx-config.conf

# Отредактируйте конфигурацию, заменив доменное имя и пути к SSL-сертификатам
nano /etc/nginx/sites-available/tg-api.itpovar.ru

# Создайте файл с паролем для базовой аутентификации
htpasswd -c /etc/nginx/.htpasswd admin

# Активируйте конфигурацию и перезапустите Nginx
ln -s /etc/nginx/sites-available/tg-api.itpovar.ru /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. Первичная аутентификация в Telegram

При первом запуске вам нужно авторизоваться:

```bash
# Отправьте запрос на авторизацию
curl -X POST https://tg-api.itpovar.ru/api/login \
     -u admin:password \
     -H "Content-Type: application/json" \
     -d '{"phone": "+79XXXXXXXXX"}'

# Вы получите SMS с кодом, который нужно подтвердить
curl -X POST https://tg-api.itpovar.ru/api/login/code \
     -u admin:password \
     -H "Content-Type: application/json" \
     -d '{"phone": "+79XXXXXXXXX", "code": "ПОЛУЧЕННЫЙ_КОД"}'
```

### 5. Интеграция с n8n

#### Создание нового инструмента в n8n

1. В n8n создайте новый Workflow "telegramUserAPI"
2. Добавьте узел Function
3. Скопируйте код из файла [telegramUserAgent.js](https://raw.githubusercontent.com/CreatmanCEO/telegram-user-api/main/telegramUserAgent.js) в этот узел
4. Сохраните и активируйте этот Workflow

#### Обновление вашего основного Workflow

1. Откройте ваш workflow "testMAIN"
2. Добавьте новый узел "Workflow" (инструмент для взаимодействия с другими Workflow)
3. Настройте его следующим образом:
   - Имя: `telegramUserAgent`
   - Описание: `Используйте этот инструмент для отправки сообщений через ваш аккаунт Telegram`
   - Workflow ID: выберите созданный ранее "telegramUserAPI"
   - Inputs: оставьте как есть

4. Обновите системное сообщение в узле "БИЗНЕС АССИСТЕНТ", добавив информацию о новом инструменте:

```
# Overview
Вы - универсальный персональный ассистент. Ваша задача - направлять запросы пользователя в нужный инструмент. Вы не должны сами писать письма или создавать даже краткие резюме, вам нужно только вызывать правильный инструмент.

## Tools
- emailAgent: Используйте этот инструмент для действий с электронной почтой
- calendarAgent: Используйте этот инструмент для действий с календарем
- contactAgent: Используйте этот инструмент для получения, обновления или добавления контактов
- Tavily: Используйте этот инструмент для поиска в интернете
- telegramUserAgent: Используйте этот инструмент для отправки сообщений через Telegram от имени пользователя

## Rules
- Некоторые действия требуют предварительного поиска контактной информации. Для следующих действий сначала получите контактную информацию и отправьте ее агенту, который в ней нуждается:
  - отправка электронных писем
  - черновики электронных писем
  - создание события в календаре с участником
  - отправка сообщений в Telegram

## Примеры использования telegramUserAgent
1. Отправка сообщения через Telegram:
   - Вход: "отправь сообщение Андрею через телеграм что я задержусь на 30 минут"
   - Действие: Использовать telegramUserAgent с параметрами {"command": "send_message", "user": "andrey", "message": "Я задержусь на 30 минут"}
   - Выход: "Сообщение успешно отправлено Андрею через Telegram. Могу я еще чем-то помочь?"

## Final Reminders
- Текущие дата/время: {{ $now }}
```

## Использование

После настройки вы сможете отправлять команды своему боту для отправки сообщений через ваш аккаунт:

- "Отправь сообщение Ивану в телеграм что встреча переносится на завтра"
- "Отправь Анне в телеграм ссылку на документ: https://docs.example.com/file123"

## Безопасность

- Используйте надежные пароли для базовой аутентификации
- Настройте правильно SSL-сертификаты для безопасной связи
- Рекомендуется ограничить доступ к API по IP-адресам через настройки Nginx
