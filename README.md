# GARDEROB MEN

Витрина и панель управления для магазина мужской одежды в Усть-Каменогорске.

## Стек

React 18 + TypeScript + Vite + Tailwind CSS v4 + Lucide React. Данные (товары, заказы, настройки) хранятся в `localStorage` — внешние сервисы и ключи API не требуются.

## Команды

```bash
npm install
npm run dev      # локальная разработка, http://localhost:5173
npm run build    # production-сборка в dist/
npm run preview  # предпросмотр собранного dist/
```

## Структура

```
src/
  types/        — типы данных (товары, заказы, настройки, корзина)
  data/         — демо-данные (seedData.ts) и ссылки на изображения
  services/     — storage.ts — обёртка над localStorage
  hooks/        — реактивные хуки поверх storage
  contexts/     — CartContext (корзина)
  components/
    storefront/ — витрина магазина
    admin/      — админ-панель
    shared/     — общие компоненты (SafeImage с фолбэком)
  pages/        — StorefrontPage, AdminPage
```

## Админ-панель

Открывается кнопкой «Админ-панель» в шапке или подвале сайта. Демо-вход: PIN `1234` или кнопка «Войти как владелец (Демо)».

## Деплой на GitHub Pages

Workflow `.github/workflows/deploy.yml` автоматически собирает и публикует сайт при пуше в ветку `main`. В настройках репозитория: **Settings → Pages → Source → GitHub Actions**.
