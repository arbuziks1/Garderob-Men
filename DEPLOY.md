# Деплой GARDEROB MEN на VPS (Ubuntu + Nginx + PM2)

Пошаговая инструкция для чистого Ubuntu-сервера в Казахстане (требование
закона о персональных данных №94-V — база должна физически находиться в РК).

## 0. Что уже готово в репозитории

- `server/.env.example` — шаблон переменных окружения бэкенда.
- `server/ecosystem.config.cjs` — конфиг PM2 для процесса API.
- `nginx.conf` — пример конфига Nginx (фронтенд + проксирование `/api`, `/uploads`).
- `server/prisma/migrations/` — готовые миграции БД.
- `server/prisma/seed.ts` — сидинг демо-каталога и админ-пользователя.

## 1. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw
```

Node.js 22 (через nvm или NodeSource — пример с NodeSource):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # должно быть v22.x
```

PostgreSQL:

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER garderob WITH PASSWORD 'ДЛИННЫЙ_СЛУЧАЙНЫЙ_ПАРОЛЬ';"
sudo -u postgres psql -c "CREATE DATABASE garderob_men OWNER garderob;"
```

Nginx, PM2, certbot:

```bash
sudo apt install -y nginx
sudo npm install -g pm2
sudo apt install -y certbot python3-certbot-nginx
```

Файрвол:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Клонирование репозитория

```bash
sudo mkdir -p /var/www/garderob-men
sudo chown $USER:$USER /var/www/garderob-men
git clone <URL_РЕПОЗИТОРИЯ> /var/www/garderob-men
cd /var/www/garderob-men
```

## 3. Бэкенд

```bash
cd /var/www/garderob-men/server
cp .env.example .env
nano .env   # заполнить DATABASE_URL (с паролем из шага 1), JWT_SECRET,
            # ADMIN_EMAIL/ADMIN_PASSWORD, CORS_ORIGIN=https://garderob.men,
            # PAYMENT_MODE=mock (пока не одобрит Kaspi — см. раздел 7)

npm ci
npm run prisma:generate
npm run prisma:migrate     # применяет миграции (prisma migrate deploy)
npm run prisma:seed        # создаёт демо-каталог и админ-пользователя из .env
npm run build               # компилирует TS в dist/
```

Запуск через PM2:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # выполнить команду, которую выведет pm2 startup, от root
```

Проверка, что API поднялся локально:

```bash
curl http://127.0.0.1:4000/api/products
```

## 4. Фронтенд

Собирается статически и раздаётся Nginx напрямую — отдельный процесс не нужен.

```bash
cd /var/www/garderob-men
npm ci
npm run build   # результат — /var/www/garderob-men/dist
```

(`vite.config.ts` уже настроен на `base: '/'` и относительные пути `/api`,
`/uploads` — одинаково работает и в dev, и в проде.)

## 5. Nginx и SSL

```bash
sudo cp nginx.conf /etc/nginx/sites-available/garderob.men
sudo nano /etc/nginx/sites-available/garderob.men   # проверить путь root и домен
sudo ln -s /etc/nginx/sites-available/garderob.men /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Выпуск сертификата (certbot сам допишет редирект на HTTPS в конфиг):

```bash
sudo certbot --nginx -d garderob.men -d www.garderob.men
```

## 6. DNS

Домен `garderob.men` сейчас указывает на GitHub Pages. Нужно поменять A-запись
(и AAAA, если есть) на IP этого VPS в панели управления доменом (там, где он
был куплен — см. более раннюю переписку про покупку домена). Пока DNS не
переключён, сайт продолжает открываться со старого статичного хостинга.

После переключения DNS можно отключить старый workflow `.github/workflows/deploy.yml`
(удалить файл или закомментировать триггер `on: push`), чтобы он не продолжал
пересобирать и публиковать статичную версию на GitHub Pages.

## 7. Переход с тестовой оплаты на реальный эквайринг

Пока `PAYMENT_MODE=mock` — работает тестовая оплата (`POST /api/dev/mock-pay/:orderId`,
кнопка «Оплатить (тест)» на странице `/order/:id`). Есть два варианта реального
эквайринга — выбираются переменной `PAYMENT_PROVIDER` в `server/.env`, код под
оба уже готов (как честные заглушки, ждущие реальных реквизитов):

**Вариант A — прямой Kaspi Pay (`PAYMENT_PROVIDER=kaspi`, по умолчанию):**

1. Заполнить в админке (Настройки → «Юридическое название» и «БИН/ИИН») —
   это обязательные поля для заявки и для публичной оферты.
2. Подать заявку на Kaspi Pay для сайта (сайт уже соответствует требованиям:
   реальные цены, публичная оферта, политика конфиденциальности, условия
   доставки и возврата — см. `/offer`, `/privacy`, `/delivery`).
3. Получить от Kaspi `KASPI_MERCHANT_ID`, `KASPI_API_TOKEN` и секрет для
   проверки подписи вебхука — вписать в `server/.env` (`KASPI_WEBHOOK_SECRET`).
4. Дать Kaspi адрес вебхука: `https://garderob.men/api/webhooks/kaspi`.
5. Реализовать реальные вызовы в `server/src/services/payment/kaspiPayService.ts`
   (сейчас это честная заглушка с `TODO` по каждому методу — методы бросают
   ошибку, пока не реализованы).
6. Параллельно подключить онлайн-кассу (Webkassa/Rekassa) — заявка в Kaspi
   отдельно от кассы, чек должен выдаваться по закону.

**Вариант B — TipTop Pay (`PAYMENT_PROVIDER=tiptop`):** альтернативный
казахстанский эквайер (ТОО TipTop Pay Kazakhstan, резидент Astana Hub). По его
собственному описанию, у него есть встроенная онлайн-касса для фискализации
безналичных платежей — если это подтвердится при подключении, отдельная
подписка на Webkassa/Rekassa может не понадобиться. Шаги аналогичны варианту A:
получить реквизиты у TipTop, вписать в `server/.env`
(`TIPTOP_TERMINAL_KEY`/`TIPTOP_API_KEY`/`TIPTOP_WEBHOOK_SECRET`), дать им адрес
вебхука `https://garderob.men/api/webhooks/tiptop`, реализовать реальные вызовы
в `server/src/services/payment/tipTopPayService.ts` (тоже заглушка с `TODO`) —
**точные названия полей и схему подписи вебхука нужно свериться с их
документацией после подписания договора**, в коде это только предположение по
структуре.

**В обоих случаях в конце:**

Поставить `PAYMENT_MODE=live` (и `PAYMENT_PROVIDER` на нужное значение) в
`.env`, `pm2 restart garderob-men-api`.

## 8. Обслуживание

- Логи и статус процесса: `pm2 logs garderob-men-api`, `pm2 status`.
- Обновление после `git pull`:
  ```bash
  cd /var/www/garderob-men/server && npm ci && npm run prisma:migrate && npm run build && pm2 restart garderob-men-api
  cd /var/www/garderob-men && npm ci && npm run build
  ```
- Резервное копирование БД (регулярно, например через cron):
  ```bash
  pg_dump -U garderob garderob_men > backup_$(date +%F).sql
  ```
- Загруженные фото лежат в `server/uploads/` — тоже нужно включить в бэкап.
