# Project Architecture

Это frontend dashboard на `Vue 3`, собранный вокруг `Vue Router`, `Vuex`, `Vite` и `Tailwind CSS`.

## Основная структура

- `src/main.ts` - точка входа. Инициализирует приложение, `router`, `store`, `axios`, Echo и polling уведомлений.
- `src/views` - страницы верхнего уровня: dashboard, orders, products, clients, settings и другие разделы.
- `src/components` - UI-компоненты и вложенные экраны по бизнес-модулям.
- `src/features` - изолированные функциональные блоки, например `gift-card`, `segment`, `vk`, `whatsapp`.
- `src/router` - маршруты приложения и вложенная навигация.
- `src/store` - глобальное состояние через `Vuex`, разбитое на модули.
- `src/api` - слой запросов к backend API.
- `src/composables` - переиспользуемая бизнес-логика на Composition API.
- `src/types`, `src/models`, `src/constants`, `src/utils`, `src/config` - типы, модели, константы, утилиты и конфигурация.
- `src/assets` и `public` - стили, изображения, иконки и статические ресурсы.

## Что важно

- Навигация строится через `src/router/index.js`.
- Основные доменные сущности разделены по модулям: заказы, товары, клиенты, склады, интеграции.
- Состояние хранится централизованно в `Vuex`-модулях внутри `src/store/modules`.
- Проект выглядит как переходный: `vite.config.js` уже есть, но скрипты в `package.json` все еще используют `vue-cli-service`.
