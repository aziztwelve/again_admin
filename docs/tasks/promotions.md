# Задача: Акции (Promotions) — Админка

**Статус:** Реализовано  
**Дата:** 2026-04-28

## Описание

Управление акциями в разделе **Клиенты → Скидки и промокоды → вкладка "Акции"**.

Акция — это спецпредложение: при выполнении условий (нужный товар в корзине + минимальная сумма) клиент получает бесплатный подарок или, если акция это разрешает, может выбрать промокод/скидку.

---

## Где найти

**Клиенты → Скидки и промокоды → вкладка "Акции"**

`src/components/discount/Discount.vue` → вкладка `promotion`

---

## Файлы

### Модель
| Файл | Описание |
|------|---------|
| `src/models/Promotion.ts` | Класс `Promotion`. Методы: `fromJSON()`, `toJSON()`, `clone()`. Геттеры: `usageLabel`, `statusLabel` |

### Composable
| Файл | Описание |
|------|---------|
| `src/composables/usePromotionFunctions.ts` | Все запросы к API: `createPromotion`, `updatePromotion`, `deletePromotion`, `getPromotions`, `getPromotion`, `getProductsList`, `getPromotionStats`, `toggleActive` |

### Компоненты
| Файл | Описание |
|------|---------|
| `src/components/discount/Promotion/PromotionList.vue` | Главный список акций с поиском и пагинацией |
| `src/components/discount/Promotion/PromotionListTable.vue` | Таблица акций |
| `src/components/discount/Promotion/PromotionSearch.vue` | Поиск по названию |
| `src/components/discount/Promotion/PromotionAddModal.vue` | Модальное окно создания акции |
| `src/components/discount/Promotion/PromotionEditModal.vue` | Модальное окно редактирования |
| `src/components/discount/Promotion/PromotionForm.vue` | Форма акции (поля + выбор товаров) |
| `src/components/discount/Promotion/PromotionStats.vue` | Статистика использования акции |
| `src/components/discount/Promotion/trigger_product/TriggerProductListModal.vue` | Диалог выбора товаров-триггеров |
| `src/components/discount/Promotion/trigger_product/TriggerProductList.vue` | Список товаров для выбора триггера |
| `src/components/discount/Promotion/trigger_product/TriggerProductListTable.vue` | Таблица товаров-триггеров |
| `src/components/discount/Promotion/gift_product/GiftProductListModal.vue` | Диалог выбора товаров-подарков |
| `src/components/discount/Promotion/gift_product/GiftProductList.vue` | Список товаров для выбора подарка |
| `src/components/discount/Promotion/gift_product/GiftProductListTable.vue` | Таблица с полем количества подарка |

---

## Поля формы (строго по ТЗ)

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|---------|
| Название акции | text | ✅ | Отображается клиенту в корзине |
| Описание акции | textarea | — | Пояснение для клиента |
| Дата начала | date | ✅ | Дата начала действия |
| Дата окончания | date | ✅ | Дата окончания, должна быть позже начала |
| Сумма покупки от (₽) | number | — | Минимальная сумма корзины для активации |
| Промокоды и скидки активны | checkbox | — | Если включено — клиент выбирает подарок ИЛИ промокод/скидку. Если выключено — только подарок |
| Акция активна | checkbox | — | Вкл/выкл акцию |
| Товар (на который действует акция) | список | ✅ | Товары-триггеры из каталога |
| Товар (который участвует в акции) | список | ✅ | Товары-подарки с указанием количества |

---

## Логика галочки "Промокоды и скидки активны"

```
allow_promo_codes = false (выключено):
    → Клиент видит только блок "Подарок"
    → Поле промокода скрыто/заблокировано
    → При оформлении заказа передаётся gift_product_id

allow_promo_codes = true (включено):
    → Клиент видит выбор: "Подарок" | "Промокод / скидка"
    → При выборе "Подарок" — поле промокода заблокировано
    → При выборе "Промокод / скидка" — поле промокода доступно
    → При оформлении передаётся use_discount_instead = true/false
```

---

## API эндпоинты (admin, auth:sanctum)

| Метод | URL | Composable-функция |
|-------|-----|--------------------|
| `GET` | `/api/promotions` | `getPromotions()` |
| `POST` | `/api/promotions` | `createPromotion()` |
| `GET` | `/api/promotions/{id}` | `getPromotion()` |
| `PUT` | `/api/promotions/{id}` | `updatePromotion()` |
| `DELETE` | `/api/promotions/{id}` | `deletePromotion()` |
| `GET` | `/api/promotions/products/list` | `getProductsList()` |
| `GET` | `/api/promotions/{id}/stats` | `getPromotionStats()` |
| `POST` | `/api/promotions/{id}/toggle-active` | `toggleActive()` |

---

## Пример использования composable

```typescript
import { usePromotionFunctions } from '@/composables/usePromotionFunctions';
import { Promotion } from '@/models/Promotion';

const { getPromotions, createPromotion, sending } = usePromotionFunctions();

// Получить список
const result = await getPromotions({ per_page: 15, page: 1 });
// result.data — массив Promotion[]
// result.meta.total — всего записей

// Создать акцию
const result = await createPromotion({
  name: 'Купи на 3000₽ — получи подарок',
  starts_at: '2026-05-01T00:00:00',
  ends_at: '2026-05-31T23:59:59',
  min_purchase_amount: 3000,
  allow_promo_codes: false,
  is_active: true,
  priority: 10,
  trigger_product_ids: [1, 2],
  gift_products: [{ product_id: 5, quantity: 1 }],
});
```

---

## Чек-лист проверки

- [ ] Клиенты → Скидки и промокоды → вкладка "Акции" открывается
- [ ] Создание акции — форма сохраняется, акция появляется в списке
- [ ] Редактирование — данные загружаются, изменения сохраняются
- [ ] Удаление — акция удаляется из списка
- [ ] Выбор товаров-триггеров из каталога работает
- [ ] Выбор товаров-подарков с количеством работает
- [ ] Галочка "Промокоды и скидки активны" сохраняется корректно
- [ ] Колонки таблицы: ID, Название, Описание, Мин. сумма, Начало, Окончание, Использовано, Активна, Промокоды
