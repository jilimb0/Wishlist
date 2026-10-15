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

- [x] **Шаг 1 (P0): Внедрение динамических Open Graph тегов в базовый `index.html`**
  - Добавлены `og:title`, `og:description`, `og:image`, `og:site_name`, `twitter:card="summary_large_image"`, `canonical` и Schema.org `WebApplication`.
  - Создан брендированный растровый баннер `public/og-wishtracker.png` (1200×630).

- [x] **Шаг 2 (P1): Генерация `robots.txt` и `sitemap.xml`**
  - Добавлены правила индексации для `/`, `/discover`, закрыты `/dashboard`, `/settings`, `/admin`.
  - Создан `sitemap.xml`.

- [ ] **Шаг 3 (P2): Серверная генерация OG-тегов для ботов соцсетей (Bot-Friendly SSR / Worker)**
