# Структура модуля "Акции"

## Созданные файлы:

### Модели
- `src/models/Promotion.ts` - Модель акции с методами fromJSON, toJSON, clone

### Composables
- `src/composables/usePromotionFunctions.ts` - Функции для работы с акциями:
  - createPromotion
  - updatePromotion
  - deletePromotion
  - getPromotions
  - getPromotion
  - getProductsList
  - getPromotionStats
  - toggleActive

### Типы
- `src/types/promotion/promotion.type.ts` - TypeScript интерфейсы
- `src/types/promotion/index.ts` - Экспорт типов

### Компоненты
- `src/components/discount/Promotion/PromotionList.vue` - Список акций
- `src/components/discount/Promotion/PromotionListTable.vue` - Таблица акций
- `src/components/discount/Promotion/PromotionSearch.vue` - Поиск
- `src/components/discount/Promotion/PromotionAddModal.vue` - Создание
- `src/components/discount/Promotion/PromotionEditModal.vue` - Редактирование
- `src/components/discount/Promotion/PromotionForm.vue` - Форма
- `src/components/discount/Promotion/PromotionStats.vue` - Статистика

### Интеграция
- `src/components/discount/Discount.vue` - Добавлена вкладка "Акции"

## Функционал:

1. **CRUD операции** через composable
2. **Модель Promotion** с геттерами:
   - usageLabel - форматированное использование (например: "5 / 100")
   - statusLabel - статус акции (Активна, Неактивна, Запланирована, Завершена)
3. **Управление товарами-триггерами** - выбор товаров, на которые действует акция
4. **Управление подарками** - добавление товаров-подарков с количеством
5. **Статистика использования** - просмотр использований акции
6. **Поиск и фильтрация**
7. **Пагинация**

## Архитектура (следует паттерну проекта):

```
Axios (HTTP запросы)
    ↓
Composable Layer (usePromotionFunctions.ts)
    ↓
Model Layer (Promotion.ts)
    ↓
Component Layer (Vue компоненты)
```

**Важно:** Composable использует axios напрямую (как useDiscountFunctions, useCategoryFunctions и другие в проекте), а не через API классы.

## Пример использования:

```typescript
// В компоненте
import {usePromotionFunctions} from "@/composables/usePromotionFunctions";
import {Promotion} from "@/models/Promotion";

const {getPromotions, createPromotion, sending} = usePromotionFunctions();

// Получить список
const promotions = await getPromotions({
  per_page: 15,
  page: 1,
  paginate: true
});

// Создать акцию
const newPromotion = Promotion.fromJSON({...});
await createPromotion(newPromotion.toJSON());
```

## Backend API Endpoints:

- GET    `/api/promotions` - Список акций
- POST   `/api/promotions` - Создать акцию
- GET    `/api/promotions/{id}` - Показать акцию
- PUT    `/api/promotions/{id}` - Обновить акцию
- DELETE `/api/promotions/{id}` - Удалить акцию
- GET    `/api/promotions/products/list` - Список товаров
- GET    `/api/promotions/{id}/stats` - Статистика
- POST   `/api/promotions/{id}/toggle-active` - Переключить активность
