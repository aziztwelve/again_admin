<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="mb-4 text-sm font-semibold text-gray-900">Итого</h3>

    <div class="space-y-2 text-sm">
      <!-- Сумма товаров -->
      <div class="flex items-center justify-between">
        <span class="text-gray-500">Товары</span>
        <span class="text-gray-900">{{ formatPrice(itemsSubtotal) }}</span>
      </div>

      <!-- Скидка на товары -->
      <div v-if="itemsDiscount > 0" class="flex items-center justify-between">
        <span class="text-gray-500">Скидка на товары</span>
        <span class="text-green-600">−{{ formatPrice(itemsDiscount) }}</span>
      </div>

      <!-- Скидка промокода -->
      <div v-if="promoDiscount > 0" class="flex items-center justify-between">
        <span class="text-gray-500">
          Промокод
          <span v-if="order.promo_code?.code" class="ml-1 font-medium text-gray-700">{{ order.promo_code.code }}</span>
        </span>
        <span class="text-green-600">−{{ formatPrice(promoDiscount) }}</span>
      </div>

      <!-- Доставка -->
      <div v-if="deliveryCost > 0" class="flex items-center justify-between">
        <span class="text-gray-500">Доставка</span>
        <span class="text-gray-900">{{ formatPrice(deliveryCost) }}</span>
      </div>
      <div v-else class="flex items-center justify-between">
        <span class="text-gray-500">Доставка</span>
        <span class="text-gray-400">Бесплатно</span>
      </div>

      <!-- Подарочная карта -->
      <div v-if="giftCardAmount > 0" class="flex items-center justify-between">
        <span class="text-gray-500">Подарочная карта</span>
        <span class="text-green-600">−{{ formatPrice(giftCardAmount) }}</span>
      </div>

      <!-- Бонусы -->
      <div v-if="bonusesUsed > 0" class="flex items-center justify-between">
        <span class="text-gray-500">Бонусы</span>
        <span class="text-green-600">−{{ formatPrice(bonusesUsed) }}</span>
      </div>

      <div class="border-t border-gray-200 pt-2" />

      <!-- Итого -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900">Итого</span>
        <span class="text-lg font-semibold text-gray-900">{{ formatPrice(order.total_amount) }}</span>
      </div>

      <!-- Вес -->
      <div class="flex items-center justify-between pt-1">
        <span class="text-xs uppercase text-gray-400">Вес</span>
        <span class="text-xs text-gray-500">{{ totalWeight }} г</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  order: { type: Object, required: true },
  summary: { type: Object, default: null },
});

const formatPrice = (value) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(n);
};

// item.price — финальная цена (после всех скидок и промо).
// item.discount — суммарная скидка за единицу (items_discount + promo_discount).
// Оригинальная сумма = (price + discount) * qty.
const itemsSubtotal = computed(() => {
  const items = props.order?.items || [];
  return items.reduce((acc, item) => {
    if (item.is_gift) return acc;
    const price   = Number(item.price    ?? item.unit_price ?? 0);
    const disc    = Number(item.discount ?? 0);
    const qty     = Number(item.quantity || 0);
    return acc + (price + disc) * qty;
  }, 0);
});

// Скидка на товары (ЛЕТО25 и подобные — items_discount без промокода)
const itemsDiscount = computed(() => Number(props.order?.total_items_discount || 0));

// Скидка промокода
const promoDiscount = computed(() => Number(props.order?.total_promo_discount || 0));

// Доставка
const deliveryCost = computed(() => Number(props.order?.delivery_cost || 0));

// Подарочная карта
const giftCardAmount = computed(() => Number(props.order?.gift_card_amount || 0));

// Бонусы
const bonusesUsed = computed(() => Number(props.order?.bonuses_used || 0));

// Вес
const totalWeight = computed(() => {
  const items = props.order?.items || [];
  const sum = items.reduce((acc, item) => {
    const w = Number(item?.product?.weight || 0);
    const q = Number(item?.quantity || 0);
    return acc + w * q;
  }, 0);
  return Number.isFinite(sum)
    ? new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(sum)
    : "—";
});
</script>
