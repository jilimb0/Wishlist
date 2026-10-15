# План миграции Wishlist на кор-технологии (@tgwrapper & @ui-construction-library)

> **Проект:** `lifestyle-productivity/Wishlist`  
> **Роль в экосистеме:** Социальный вишлист с краудфандингом подарков, скраперами маркетплейсов и реферальной монетизацией  
> **Приоритет миграции:** 🎯 **Tier 3 (Средний)**  

---

## 1. Текущий технологический срез (As-Is)

### Telegram & TMA:
* **Что используется сейчас:** В `backend/src/modules/telegram/telegram.service.ts` отправка уведомлений о бронировании подарков и генерация диплинков авторизации реализованы через NestJS + `axios.post('https://api.telegram.org/bot...')`.
* **Недостатки:** Нет централизованной обработки сетевых сбоев, нет типизации инлайн-кнопок, нет Telegram Mini App версии вишлиста.

### Web & UI:
* **Что используется сейчас:** `web/` (34 TSX компонента) использует Vite, React 19, Tailwind CSS v4 (`@tailwindcss/vite`).
* **Статус `@ui-construction-library`:** ❌ Не установлена (0 компонентов).

---

## 2. Целевая архитектура (To-Be)

1. **Перевод бэкенда на `@tgwrapper/core@0.20.1`:**
   - Инкапсуляция логики отправки сообщений в `TelegramBotClient` из `@tgwrapper/core`.
   - Внедрение интерактивных подтверждений подарков через Telegram Mini App.
2. **Перевод `web/` на `@ui-construction-library/core@0.9.0`:**
   - Карточки товаров, шкала сбора денег (Краудфандинг), модалка бронирования подарка и форма добавления ссылки по маркетплейсу переводятся на компоненты дизайн-системы.

---

## 3. Пошаговый план перехода

### Шаг 1. Перевод `TelegramService` на `@tgwrapper/core`
- [x] Добавить в `backend/package.json`:
  ```json
  "dependencies": {
    "@tgwrapper/core": "^0.20.1"
  }
  ```
- [x] В `backend/src/modules/telegram/telegram.service.ts`:
  - Заменить вызовы `axios` на `createBotClient`.
  - Добавить типизированные кнопки («Открыть подарок в боте», «Сброситься на подарок»).

### Шаг 2. Миграция веб-интерфейса `web/` на `@ui-construction-library`
- [x] Добавить в `web/package.json`:
  ```json
  "dependencies": {
    "@ui-construction-library/core": "^0.9.0",
    "@ui-construction-library/icons": "^0.6.0"
  }
  ```
- [x] Замена компонентов:
  - Карточка подарка (`ItemCard.tsx`): `Card`, `Badge` (Reserved, Group Gift), `Progress`, `Button`, `ExternalLinkIcon`, `TrashIcon`, `PencilIcon`.
  - Шкала краудфандинга (`GroupGiftModal.tsx`): `Progress`, `Button`.
  - Модалка шеринга (`ShareWishlistModal.tsx`): `Button`, `CopyIcon`, `ShareIcon`.
  - Пейволл подписки (`PaywallModal.tsx`): `Card`, `Badge`, `Button`, `Input`.

### Шаг 3. Верификация
- [x] Запуск `pnpm lint` / Biome (`pnpm check:ci` 0 errors).
- [x] Запуск `pnpm test` (все 82 теста во всех пакетах пройдены).
- [x] Сборка веб-приложения: `pnpm --filter wishtracker-web run build`.

---

## 4. Оценка трудоёмкости
* **Telegram-слой:** 0.5 дня.
* **UI-слой:** 1.5 дня.
* **Суммарно:** 2 рабочих дня.
