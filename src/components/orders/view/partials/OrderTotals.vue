<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-end gap-8 text-sm">
      <div>
        <div class="text-xs uppercase text-gray-500">Вес</div>
        <div class="text-gray-900">{{ totalWeight }} кг</div>
      </div>
      <div>
        <div class="text-xs uppercase text-gray-500">Итого</div>
        <div class="text-lg font-semibold text-gray-900">
          {{ formatPrice(order.total_amount) }}
        </div>
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

const totalWeight = computed(() => {
  const items = props.order?.items || [];
  const sum = items.reduce((acc, item) => {
    const w = Number(item?.product?.weight || 0);
    const q = Number(item?.quantity || 0);
    return acc + w * q;
  }, 0);
  return Number.isFinite(sum) ? sum.toFixed(2) : "—";
});
</script>
