# План SEO-оптимизации и вирусного шеринга: Wishlist (WishTracker)

> **Текущий SEO-скор:** 35 / 100 (🔴 Критический уровень для вирусного потребительского продукта)  
> **Дата аудита:** Октябрь 2026  
> **Роль в экосистеме:** Сервис умных списков желаний, совместного сбора на подарки и отслеживания цен  
> **Стек:** React 19 + TypeScript + Vite (CSR) + NestJS Backend  
> **Глобальный план:** [GLOBAL_SEO_OPTIMIZATION_PLAN.md](file:///Users/jilimbo/Documents/Personal/GLOBAL_SEO_OPTIMIZATION_PLAN.md)

---

## 1. Обнаруженные проблемы и уязвимости

### [P0] Ломаный шеринг списков желаний в социальных сетях и мессенджерах
* **Файлы:** `web/index.html`, `web/src/pages/WishlistDetail.tsx`, `web/src/pages/PublicProfile.tsx`
* **Проблема:** Приложение построено как чистый Client-Side SPA на Vite. Когда пользователь делится ссылкой на свой вишлист (`https://wishtracker.app/wishlist/abc-123`) в Telegram, WhatsApp или ВКонтакте, краулер соцсети запрашивает статический `index.html` и получает:
  - `<title>WishTracker</title>`
  - `<meta name="description" content="WishTracker — Create wishlists, track prices, share with friends" />`
  - Ноль картинок, ноль информации об авторе списка, ноль информации о подарках.
* **Влияние:** Катастрофическая потеря вирусного потенциала. Получатель ссылки видит обезличенное системное превью вместо «Вишлист на День Рождения от Алисы (5 подарков)».

### [P1] Отсутствие `sitemap.xml` и `robots.txt`
* Поисковики не могут проиндексировать публичные списки желаний и профили, открытые пользователями для публичного доступа.

---

## 2. Пошаговый план внедрения (Action Plan)

- [ ] **Шаг 1 (P0): Внедрение динамических Open Graph тегов в базовый `index.html`**
  ```html
  <meta property="og:site_name" content="WishTracker" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="WishTracker — Умные вишлисты и совместные подарки" />
  <meta property="og:description" content="Создавай списки желаний с Wildberries, Ozon и Amazon. Скидывайся с друзьями на подарки в 1 клик." />
  <meta property="og:image" content="https://wishtracker.app/og-wishtracker.png" />
  <meta name="twitter:card" content="summary_large_image" />
  ```

- [ ] **Шаг 2 (P0): Серверная генерация OG-тегов для ботов соцсетей (Bot-Friendly SSR / Worker)**
  - Реализовать в NestJS бэкенде (`backend/src`) или через Edge Function (Cloudflare Worker / Vercel Edge) легкий мидлвар для User-Agent ботов (TelegramBot, WhatsApp, TwitterBot, vkShare, Slackbot):
    - При запросе `/wishlist/:id` отдавать минимальный HTML с заполненными `og:title` («Вишлист [Имя]»), `og:description` («Смотрите, какие подарки выбрал пользователь...») и `og:image` (коллаж фото подарков или аватар).

- [ ] **Шаг 3 (P1): Генерация `robots.txt` и динамического `sitemap.xml`**
  - Разрешить индексацию `/`, `/discover`, `/public/*`.
  - Запретить `/dashboard`, `/settings`, `/admin`.
  - Бэкенд-эндпоинт `/api/sitemap.xml` отдающий список актуальных публичных вишлистов.
